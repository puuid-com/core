import { symmetricDiffById as symmetricDiff } from "@/lib/utils";
import { db } from "@/server/db";
import { summonerRefresh } from "@/server/db/schema/summoner-refresh";
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
import { SummonerStatisticService } from "@/server/services/SummonerStatisticService";
import { LOL_QUEUES, type LolQueueType } from "@/shared";
import { and, eq, inArray } from "drizzle-orm";
import type { NewLineKind } from "typescript";
import { uuidv7 } from "uuidv7";

export class SummonerRefreshService {
  private static MIN_SEC_BETWEEN_REFRESH = 1; // 1 sec
  private static TIME_BEFORE_FORCED_REFRESH = 2 * 24 * 60 * 60 * 1000;

  private static async shouldForceRefresh(
    summonerRefresh: SummonerRefreshType
  ) {
    const lastMs = summonerRefresh.refreshedAt.getTime();

    if (Number.isNaN(lastMs)) return true;

    return Date.now() - lastMs > this.TIME_BEFORE_FORCED_REFRESH;
  }

  static async getRefreshSummoners(
    puuids: SummonerType["puuid"][],
    queueType: LolQueueType
  ) {
    return db.query.summonerRefresh.findMany({
      where: and(
        inArray(summonerRefresh.puuid, puuids),
        eq(summonerRefresh.queueType, queueType)
      ),
      with: {
        recentSummonerStatistic: true,
        summonerStatistic: true,
      },
    });
  }

  static async refreshSummoners(
    puuids: SummonerType["puuid"][],
    queueType: LolQueueType,
    isFullRefresh: boolean,
    matches: Record<SummonerType["puuid"], MatchWithSummonersType[]>,
    leagues: Record<SummonerType["puuid"], LeagueRowType[]>
  ) {
    const currentRefreshes = await this.getRefreshSummoners(puuids, queueType);
    const refreshesToKeep = currentRefreshes.filter(
      (r) => !this.shouldForceRefresh(r)
    );
    const puuidsToRefresh = symmetricDiff(
      currentRefreshes,
      refreshesToKeep,
      "puuid"
    ).map((r) => r.puuid);

    const newRefreshes = await db.transaction(async (tx) => {
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
            leagues[s.puuid]?.find((l) => l.queueType === queueType)?.id ??
            null;

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

            recentSummonerStatisticId: s.recentSummonerStatistic?.id,
            summonerStatisticId: s.summonerStatistic?.id,
          };
        })
        .filter(Boolean) as SummonerRefreshType[];

      await tx.insert(summonerRefresh).values(insertValues);

      return insertValues.map((value) => {
        const puuid = value.puuid;
        const stats = newStatistics.find((s) => s.puuid === puuid)!;

        return {
          ...value,
          recentSummonerStatistic: stats.summonerStatistic,
          summonerStatistic: stats.recentSummonerStatistic,
        };
      });
    });

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
