import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { db, type TransactionType } from "@/server/db";
import type { MatchRowType, MatchWithSummonersType } from "@/server/db/schema/match";
import { pipeStep } from "@/server/lib/generator";
import { SummonerService } from "@/server/services/summoner/SummonerService";
import { LeagueService } from "@/server/services/league/LeagueService";
import { LOL_QUEUES } from "@/server/services/match/queues";
import { StatisticService } from "@/server/services/StatisticService";
import { and, eq, sql } from "drizzle-orm";
import type { LeagueRowType } from "@/server/db/schema/league";
import {
  summonerRefresh,
  type InsertSummonerRefreshType,
} from "@/server/db/schema/summoner-refresh";
import type { SummonerType } from "@/server/db/schema/summoner";
import { MatchService } from "@/server/services/match/MatchService";

export type FetchingSummonerSteps = {
  step: "fetching_summoner";
};

export type FetchingMatchesSteps =
  | { step: "fetching_matches"; matchesToFetch: number }
  | { step: "fetching_matches"; matchesFetched: number };

export type SavingMatchesSteps = {
  step: "saving_matches";
};

export type FetchingLeaguesSteps = {
  step: "fetching_leagues";
};

export type FetchingStatsSteps = {
  step: "fetching_stats";
};

export type StepsType =
  | FetchingSummonerSteps
  | FetchingMatchesSteps
  | SavingMatchesSteps
  | FetchingLeaguesSteps
  | FetchingStatsSteps;

export type RefreshProgressMsgType =
  | ({
      status: "step_started" | "step_finished" | "step_in_progress";
    } & StepsType)
  | {
      status: "started" | "finished";
    };

export class RefreshService {
  private static MIN_SEC_BETWEEN_REFRESH = 1; // 1 sec

  static async getLastRefresh(puuid: SummonerType["puuid"], queue: LolQueueType) {
    return db.query.summonerRefresh.findFirst({
      where: and(eq(summonerRefresh.puuid, puuid), eq(summonerRefresh.queueType, queue)),
    });
  }

  static async canRefresh(puuid: SummonerType["puuid"], queue: LolQueueType) {
    const lastRefresh = await this.getLastRefresh(puuid, queue);
    if (!lastRefresh) return true;

    const secSinceLastRefresh = (new Date().getTime() - lastRefresh.refreshedAt.getTime()) / 1000;

    return secSinceLastRefresh > this.MIN_SEC_BETWEEN_REFRESH;
  }

  static async updateLastRefresh(
    puuid: SummonerType["puuid"],
    queue: LolQueueType,
    isFullRefresh: boolean,
    lastMatchCreationMs: MatchRowType["gameCreationMs"] | null,
  ) {
    const lastGameCreationEpochSec = lastMatchCreationMs
      ? Math.floor(lastMatchCreationMs / 1000)
      : null;

    return db
      .insert(summonerRefresh)
      .values({ puuid, lastGameCreationEpochSec, isFullRefresh, queueType: queue })
      .onConflictDoUpdate({
        target: [summonerRefresh.puuid],
        set: {
          lastGameCreationEpochSec,
          refreshedAt: new Date(),
        },
      });
  }

  static async batchUpdateLastRefreshTx(
    tx: TransactionType,
    dataBySummoner: { summoner: SummonerType; lastMatch: MatchWithSummonersType | undefined }[],
    queueType: LolQueueType,
    isFullRefresh: boolean,
  ) {
    const updades: InsertSummonerRefreshType[] = dataBySummoner.map((d) => {
      const lastGameCreationEpochSec = d.lastMatch?.gameCreationMs
        ? Math.floor(d.lastMatch.gameCreationMs / 1000)
        : null;

      return {
        puuid: d.summoner.puuid,
        queueType,
        lastGameCreationEpochSec,
        refreshedAt: new Date(),
        isFullRefresh,
      };
    });

    await tx
      .insert(summonerRefresh)
      .values(updades)
      .onConflictDoUpdate({
        target: [summonerRefresh.puuid],
        set: {
          lastGameCreationEpochSec: sql`excluded.last_game_creation_epoch_sec`,
          refreshedAt: sql`excluded.refreshed_at`,
        },
      });
  }

  static async *refreshSummonerData(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType,
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
    const lastRefresh = await this.getLastRefresh(puuid, queueType);

    const queueId = LOL_QUEUES[queueType].queueId;

    yield { status: "started" };

    // progressFetchSummoner()
    const { stream: $summonerStream, result: $summonerResult } = pipeStep(
      this.progressFetchSummoner(puuid),
    );
    for await (const msg of $summonerStream) yield msg;
    const summoner = await $summonerResult;

    const lastGameCreationEpochSec = lastRefresh?.lastGameCreationEpochSec ?? null;
    const shouldUseEpochSec = lastGameCreationEpochSec !== null && !!lastRefresh?.isFullRefresh;

    // progressFetchMatches()
    const { stream: $matchesStream /* , result: $matchesResult */ } = pipeStep(
      this.progressFetchMatches(
        summoner,
        queueId,
        shouldUseEpochSec ? lastGameCreationEpochSec : undefined,
      ),
    );
    for await (const msg of $matchesStream) yield msg;
    /* const matches = await $matchesResult;
     */
    // progressFetchLeagues()
    const { stream: $leaguesStream, result: $leaguesResult } = pipeStep(
      this.progressFetchLeagues(summoner),
    );
    for await (const msg of $leaguesStream) yield msg;
    const leagues = await $leaguesResult;

    // progressFetchStats()
    const { stream: $statsStream, result: $statsResult } = pipeStep(
      this.progressFetchStats(summoner, queueType, leagues /* , matches */),
    );
    for await (const msg of $statsStream) yield msg;
    const { lastMatch } = await $statsResult;

    await this.updateLastRefresh(puuid, queueType, true, lastMatch?.gameCreationMs ?? null);

    yield { status: "finished" };
  }

  private static async *progressFetchSummoner(
    puuid: SummonerType["puuid"],
  ): AsyncGenerator<RefreshProgressMsgType, SummonerType, void> {
    yield { status: "step_started", step: "fetching_summoner" };

    yield { status: "step_in_progress", step: "fetching_summoner" };

    const summoner = await db.transaction((tx) =>
      SummonerService.getOrCreateSummonerByPuuidTx(tx, puuid, true),
    );

    yield { status: "step_finished", step: "fetching_summoner" };

    return summoner;
  }

  private static async *progressFetchMatches(
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"],
    startTimeEpoch: number | undefined,
  ): AsyncGenerator<RefreshProgressMsgType, MatchWithSummonersType[], void> {
    const { MatchService } = await import("@/server/services/match/MatchService");

    const ids = await MatchService._getAllMatcheIdsDTOByPuuid(id, queueId, startTimeEpoch);

    yield {
      status: "step_in_progress",
      step: "fetching_matches",
      matchesToFetch: ids.length,
    };

    if (ids.length === 0) {
      yield { status: "step_finished", step: "fetching_matches", matchesFetched: 0 };

      return [];
    }

    const alreadySaved = await MatchService.getMatchesDBByMatchIds(ids);

    const notSavedIds = ids.filter((mid) => !alreadySaved.some((m) => m.matchId === mid));

    if (alreadySaved.length > 0) {
      yield {
        status: "step_in_progress",
        step: "fetching_matches",
        matchesFetched: alreadySaved.length,
      };
    }

    const batchSize = 50;
    const totalBatches = Math.ceil(notSavedIds.length / batchSize);
    const allNewMatches: MatchWithSummonersType[] = alreadySaved;

    for (let b = 0; b < totalBatches; b++) {
      const start = b * batchSize;
      const end = Math.min(notSavedIds.length, start + batchSize);
      const slice = notSavedIds.slice(start, end);

      const tasks = slice.map((mid) => MatchService.getMatchDTOById(mid, false));

      const newMatches = await Promise.all(tasks);

      yield {
        status: "step_in_progress",
        step: "fetching_matches",
        matchesFetched: newMatches.length,
      };

      if (newMatches.length === 0) continue;

      const _newMatches = await db.transaction(async (tx) => {
        return await MatchService.saveMatchesDTOtoDBTx(tx, newMatches);
      });

      allNewMatches.push(..._newMatches);

      console.log(`Fetched batch ${b + 1}/${totalBatches}`);
    }

    yield { status: "step_finished", step: "fetching_matches", matchesFetched: 0 };

    return allNewMatches;
  }

  private static async *progressFetchLeagues(
    id: Pick<SummonerType, "region" | "puuid">,
  ): AsyncGenerator<RefreshProgressMsgType, LeagueRowType[], void> {
    yield { status: "step_started", step: "fetching_leagues" };

    yield { status: "step_in_progress", step: "fetching_leagues" };

    const leagues = await db.transaction((tx) => LeagueService.cacheLeaguesTx(tx, id));

    yield { status: "step_finished", step: "fetching_leagues" };

    return leagues;
  }

  private static async *progressFetchStats(
    id: Pick<SummonerType, "region" | "puuid">,
    queue: LolQueueType,
    leagues: LeagueRowType[],
    matches?: MatchWithSummonersType[],
  ): AsyncGenerator<
    RefreshProgressMsgType,
    { lastMatch: MatchWithSummonersType | undefined },
    void
  > {
    yield { status: "step_started", step: "fetching_stats" };
    yield { status: "step_in_progress", step: "fetching_stats" };

    const statsData = await db.transaction(async (tx) => {
      return await StatisticService.refreshSummonerStatisticTx(
        tx,
        id,
        queue,
        true,
        leagues,
        matches,
      );
    });

    yield { status: "step_finished", step: "fetching_stats" };

    return {
      lastMatch: statsData.lastMatch,
    };
  }

  static async batchFastRefresh(summoners: SummonerType[], queueType: LolQueueType) {
    return db.transaction(async (tx) => {
      const queueId = LOL_QUEUES[queueType].queueId;

      const matchIdsData = await Promise.all(
        summoners.map(async (s) => {
          const ids = await MatchService.getMatchIdsDTOByPuuidPaged(
            { region: s.region, puuid: s.puuid },
            {
              queue: queueId,
              count: 10,
              start: 0,
            },
          );

          return {
            puuid: s.puuid,
            matchIds: ids,
          };
        }),
      );

      const matches = await MatchService.getAndSaveMatcheIdsTx(
        tx,
        matchIdsData.flatMap((m) => m.matchIds.ids),
      );

      const dataBySummoner = summoners.map((s) => {
        const matchIds = matchIdsData.find((m) => m.puuid === s.puuid)!.matchIds.ids;
        const summonerMatches = matches.filter((m) => matchIds.includes(m.matchId));

        return {
          summoner: s,
          matches: summonerMatches,
          lastMatch: summonerMatches.sort((a, b) => b.gameCreationMs - a.gameCreationMs).at(0),
        };
      });

      const { statistics } = await StatisticService.batchRefreshSummonerStatitisticsTx(
        tx,
        dataBySummoner,
        queueType,
        false,
      );

      await this.batchUpdateLastRefreshTx(tx, dataBySummoner, queueType, false);

      return statistics;
    });
  }
}
