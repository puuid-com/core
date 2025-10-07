import { symmetricDiffById as symmetricDiff } from "@/lib/utils";
import { db, type TransactionType } from "@/server/db";
import type { LeagueWithLeaderboardEntryType } from "@/server/db/schema/league";
import {
  summonerRefresh,
  type SummonerRefreshWithStatisticType,
} from "@/server/db/schema/summoner-refresh";
import { summonerStatisticTable } from "@/server/db/schema/summoner-statistic";
import type {
  InsertSummonerRefreshType,
  LeagueRowType,
  MatchRowType,
  MatchWithSummonersType,
  SummonerRefreshType,
  SummonerType,
} from "@/server/db/types";
import { LeagueService } from "@/server/services/league";
import { MatchService } from "@/server/services/match/MatchService";
import type { RefreshProgressMsgType } from "@/server/services/RefreshProgressService";
import { SummonerStatisticService } from "@/server/services/SummonerStatisticService";
import { LOL_QUEUES, type LolQueueType } from "@/shared";
import { and, eq, inArray } from "drizzle-orm";
import type { NewLineKind } from "typescript";
import { uuidv7 } from "uuidv7";

export class SummonerRefreshService {
  private static MIN_SEC_BETWEEN_REFRESH = 1; // 1 sec
  private static TIME_BEFORE_FORCED_REFRESH = 2 * 24 * 60 * 60 * 1000;

  static async *progressFetchStats(
    id: Pick<SummonerType, "region" | "puuid">,
    queue: LolQueueType,
    leagues: LeagueWithLeaderboardEntryType[],
    matches: MatchWithSummonersType[]
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
    yield { status: "step_started", step: "fetching_stats" };
    yield { status: "step_in_progress", step: "fetching_stats" };

    await db.transaction(async (tx) => {
      return await this.refreshSummonersTx(
        tx,
        [id.puuid],
        queue,
        true,
        { [id.puuid]: matches },
        { [id.puuid]: leagues }
      );
    });

    yield { status: "step_finished", step: "fetching_stats" };
  }

  private static async shouldForceRefresh(
    summonerRefresh: SummonerRefreshType
  ) {
    const lastMs = summonerRefresh.refreshedAt.getTime();

    if (Number.isNaN(lastMs)) return true;

    return Date.now() - lastMs > this.TIME_BEFORE_FORCED_REFRESH;
  }

  static async getSummonerRefreshes(puuids: SummonerType["puuid"][]) {
    const data = await db.query.summonerRefresh.findMany({
      where: and(inArray(summonerRefresh.puuid, puuids)),
      with: {
        recentSummonerStatistic: true,
        summonerStatistic: true,
        league: {
          with: {
            leaderboardEntry: true,
          },
        },
      },
    });

    return puuids.reduce<
      {
        puuid: SummonerType["puuid"];
        refreshes: Partial<
          Record<LolQueueType, SummonerRefreshWithStatisticType>
        >;
      }[]
    >((acc, puuid) => {
      acc.push({
        puuid: puuid,
        refreshes: {
          ARAM: data.find((d) => d.queueType === "ARAM"),
          RANKED_FLEX_SR: data.find((d) => d.queueType === "RANKED_FLEX_SR"),
          RANKED_SOLO_5x5: data.find((d) => d.queueType === "RANKED_SOLO_5x5"),
        },
      });

      return acc;
    }, []);
  }

  static async getQueueSummonerRefreshes(
    puuids: SummonerType["puuid"][],
    queueType: LolQueueType
  ): Promise<SummonerRefreshWithStatisticType[]> {
    return db.query.summonerRefresh.findMany({
      where: and(
        inArray(summonerRefresh.puuid, puuids),
        eq(summonerRefresh.queueType, queueType)
      ),
      with: {
        recentSummonerStatistic: true,
        summonerStatistic: true,
        league: {
          with: {
            leaderboardEntry: true,
          },
        },
      },
    });
  }

  static async refreshSummoners(
    puuids: SummonerType["puuid"][],
    queueType: LolQueueType,
    isFullRefresh: boolean,
    matches: Record<SummonerType["puuid"], MatchWithSummonersType[]>,
    leagues: Record<SummonerType["puuid"], LeagueWithLeaderboardEntryType[]>
  ) {
    return db.transaction((tx) =>
      this.refreshSummonersTx(
        tx,
        puuids,
        queueType,
        isFullRefresh,
        matches,
        leagues
      )
    );
  }

  static async refreshSummonersTx(
    tx: TransactionType,
    puuids: SummonerType["puuid"][],
    queueType: LolQueueType,
    isFullRefresh: boolean,
    matches: Record<SummonerType["puuid"], MatchWithSummonersType[]>,
    leagues: Record<SummonerType["puuid"], LeagueWithLeaderboardEntryType[]>
  ): Promise<SummonerRefreshWithStatisticType[]> {
    const currentRefreshes = await this.getQueueSummonerRefreshes(
      puuids,
      queueType
    );
    const refreshesToKeep = currentRefreshes.filter(
      (r) => !this.shouldForceRefresh(r)
    );
    const puuidsToRefresh = symmetricDiff(
      currentRefreshes,
      refreshesToKeep,
      "puuid"
    ).map((r) => r.puuid);

    if (
      refreshesToKeep.length === puuidsToRefresh.length &&
      puuidsToRefresh.length === puuids.length
    ) {
      return refreshesToKeep;
    }

    const newStatistics =
      await SummonerStatisticService.insertSummonerStatisticsTx(
        tx,
        puuidsToRefresh,
        matches
      );

    console.log({ newStatistics });

    const insertValues = newStatistics
      .map<SummonerRefreshType | null>((s) => {
        const lastGameCreationMs =
          isFullRefresh && matches[s.puuid]?.length
            ? Math.max(...matches[s.puuid]!.map((m) => m.gameCreationMs))
            : null;
        const leagueId =
          leagues[s.puuid]?.find((l) => l.queueType === queueType)?.id ?? null;

        if (!s.recentSummonerStatistic || !s.summonerStatistic) return null;

        return {
          id: uuidv7(),
          isFullRefresh: true,
          lastGameCreationEpochSec: lastGameCreationMs
            ? Math.floor(lastGameCreationMs / 1000)
            : null,
          latestLeagueEntryId: leagueId,
          puuid: s.puuid,
          queueType: queueType,
          refreshedAt: new Date(),

          recentSummonerStatisticId: s.recentSummonerStatistic.id,
          summonerStatisticId: s.summonerStatistic.id,
        };
      })
      .filter(Boolean) as SummonerRefreshType[];

    if (insertValues.length) {
      await tx.insert(summonerRefresh).values(insertValues);
    }

    const newRefreshes: SummonerRefreshWithStatisticType[] = insertValues.map(
      (value) => {
        const puuid = value.puuid;
        const stats = newStatistics.find((s) => s.puuid === puuid)!;

        return {
          ...value,
          recentSummonerStatistic: stats.summonerStatistic ?? null,
          summonerStatistic: stats.recentSummonerStatistic ?? null,
          league:
            leagues[puuid]?.find((l) => l.id === value.latestLeagueEntryId) ??
            null,
        };
      }
    );

    return [...refreshesToKeep, ...newRefreshes];
  }

  static async batchFastRefresh(
    summoners: Pick<SummonerType, "puuid" | "region">[],
    queueType: LolQueueType
  ) {
    return db.transaction(async (tx) => {
      const dataBySummoner = await MatchService.batchGetMatchesPagedTx(
        tx,
        summoners,
        { queue: LOL_QUEUES[queueType].queueId, start: 0, count: 10 }
      );

      const leagues = await LeagueService.batchCacheLeaguesBySummonersTx(
        tx,
        summoners
      );

      return this.refreshSummoners(
        summoners.map((s) => s.puuid),
        queueType,
        false,
        dataBySummoner,
        leagues
      );
    });
  }
}
