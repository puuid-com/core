import { db, type TransactionType } from "@/server/db";
import type { LeagueWithLeaderboardEntryType } from "@/server/db/schema/league";
import {
  summonerRefresh,
  type SummonerRefreshWithStatisticType,
} from "@/server/db/schema/summoner-refresh";
import type {
  MatchWithSummonersType,
  SummonerRefreshType,
  SummonerType,
} from "@/server/db/types";
import { SummonerService } from "@/server/services";
import { LeagueService } from "@/server/services/league";
import { MatchService } from "@/server/services/match/MatchService";
import type { RefreshProgressMsgType } from "@/server/services/RefreshProgressService";
import { SummonerStatisticService } from "@/server/services/SummonerStatisticService";
import { LOL_QUEUES, type LolQueueType } from "@/shared";
import { and, eq, inArray, sql } from "drizzle-orm";
import type { NewLineKind } from "typescript";
import { uuidv7 } from "uuidv7";

export class SummonerRefreshService {
  private static MIN_SEC_BETWEEN_REFRESH = 1; // 1 sec
  private static TIME_BEFORE_FORCED_REFRESH = 1; // 2 * 24 * 60 * 60 * 1000;

  static async *progressFetchStats(
    summoner: SummonerType,
    queue: LolQueueType,
    leagues: LeagueWithLeaderboardEntryType[],
    matches: MatchWithSummonersType[]
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
    yield { status: "step_started", step: "fetching_stats" };
    yield { status: "step_in_progress", step: "fetching_stats" };

    await db.transaction(async (tx) => {
      return await this.refreshSummonersTx(
        tx,
        [summoner],
        queue,
        true,
        { [summoner.puuid]: matches },
        { [summoner.puuid]: leagues }
      );
    });

    yield { status: "step_finished", step: "fetching_stats" };
  }

  private static shouldForceRefresh(summonerRefresh: SummonerRefreshType) {
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
    summoners: SummonerType[],
    queueType: LolQueueType,
    isFullRefresh: boolean,
    matches: Record<SummonerType["puuid"], MatchWithSummonersType[]>,
    leagues: Record<SummonerType["puuid"], LeagueWithLeaderboardEntryType[]>
  ) {
    return db.transaction((tx) =>
      this.refreshSummonersTx(
        tx,
        summoners,
        queueType,
        isFullRefresh,
        matches,
        leagues
      )
    );
  }

  static async refreshSummonersTx(
    tx: TransactionType,
    summoners: SummonerType[],
    queueType: LolQueueType,
    isFullRefresh: boolean,
    matches: Record<SummonerType["puuid"], MatchWithSummonersType[]>,
    leagues: Record<SummonerType["puuid"], LeagueWithLeaderboardEntryType[]>
  ): Promise<SummonerRefreshWithStatisticType[]> {
    const summonersToUpdateMainChampion = summoners
      .filter((s) => s.mainChampionId === null)
      .map((s) => s.puuid);

    const puuids = summoners.map((s) => s.puuid);

    const currentRefreshes = await this.getQueueSummonerRefreshes(
      puuids,
      queueType
    );
    const refreshesToKeep = currentRefreshes.filter(
      (r) => !this.shouldForceRefresh(r)
    );
    const refreshesToForce = currentRefreshes.filter((r) =>
      this.shouldForceRefresh(r)
    );

    const puuidsWithExistingRefresh = new Set(
      currentRefreshes.map((refresh) => refresh.puuid)
    );
    const newPuuids = puuids.filter(
      (puuid) => !puuidsWithExistingRefresh.has(puuid)
    );

    const puuidsToRefresh = Array.from(
      new Set([
        ...refreshesToForce.map((refresh) => refresh.puuid),
        ...newPuuids,
      ])
    );

    if (!puuidsToRefresh.length) {
      return refreshesToKeep;
    }

    const newStatistics =
      await SummonerStatisticService.insertSummonerStatisticsTx(
        tx,
        puuidsToRefresh,
        matches
      );

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
      await tx
        .insert(summonerRefresh)
        .values(insertValues)
        .onConflictDoUpdate({
          target: [summonerRefresh.puuid, summonerRefresh.queueType],
          set: {
            isFullRefresh: sql.raw(
              `excluded.${summonerRefresh.isFullRefresh.name}`
            ),
            lastGameCreationEpochSec: sql.raw(
              `excluded.${summonerRefresh.lastGameCreationEpochSec.name}`
            ),
            latestLeagueEntryId: sql.raw(
              `excluded.${summonerRefresh.latestLeagueEntryId.name}`
            ),
            recentSummonerStatisticId: sql.raw(
              `excluded.${summonerRefresh.recentSummonerStatisticId.name}`
            ),
            refreshedAt: sql.raw(
              `excluded.${summonerRefresh.refreshedAt.name}`
            ),
            summonerStatisticId: sql.raw(
              `excluded.${summonerRefresh.summonerStatisticId.name}`
            ),
          },
        });
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

    const refreshes = [...refreshesToKeep, ...newRefreshes];

    if (summonersToUpdateMainChampion.length) {
      await SummonerService.batchUpdateMainChampion(
        summonersToUpdateMainChampion.reduce(
          (acc, puuid) => {
            const stats = refreshes.find(
              (r) => r.puuid === puuid
            )!.summonerStatistic;

            if (!stats?.mainChampionId) return acc;

            acc.push({
              puuid: puuid,
              mainChampionId: stats.mainChampionId,
            });

            return acc;
          },
          [] as {
            puuid: SummonerType["puuid"];
            mainChampionId: number;
          }[]
        )
      );
    }

    return refreshes;
  }

  static async batchFastRefresh(
    summoners: SummonerType[],
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
        summoners,
        queueType,
        false,
        dataBySummoner,
        leagues
      );
    });
  }
}
