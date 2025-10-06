import type { LolQueueType } from "@/shared/types/dto/LeagueDTO";
import { db, type TransactionType } from "@/server/db";
import type {
  MatchRowType,
  MatchWithSummonersType,
} from "@/server/db/schema/match";
import { pipeStep } from "@/server/lib/generator";
import { SummonerService } from "@/server/services/SummonerService";
import { LeagueService } from "@/server/services/league/LeagueService";
import { LOL_QUEUES } from "@/shared/types/riot/queues";
import { and, eq, sql } from "drizzle-orm";
import type { LeagueRowType } from "@/server/db/schema/league";
import {
  summonerRefresh,
  type InsertSummonerRefreshType,
} from "@/server/db/schema/summoner-refresh";
import type { SummonerType } from "@/server/db/schema/summoner";
import { MatchService } from "@/server/services/match/MatchService";
import { SummonerRefreshService } from "@/server/services/SummonerRefreshService";

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

export class RefreshProgressService {
  static async *refreshSummonerData(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType
  ): AsyncGenerator<RefreshProgressMsgType, void, void> {
    const [lastRefresh] =
      await SummonerRefreshService.getQueueSummonerRefreshes(
        [puuid],
        queueType
      );

    const queueId = LOL_QUEUES[queueType].queueId;

    yield { status: "started" };

    // progressFetchSummoner()
    const { stream: $summonerStream, result: $summonerResult } = pipeStep(
      SummonerService.progressFetchSummoner(puuid)
    );
    for await (const msg of $summonerStream) yield msg;
    const summoner = await $summonerResult;

    const lastGameCreationEpochSec =
      lastRefresh?.lastGameCreationEpochSec ?? null;
    const shouldUseEpochSec =
      lastGameCreationEpochSec !== null && !!lastRefresh?.isFullRefresh;

    // progressFetchMatches()
    const { stream: $matchesStream, result: $matchesResult } = pipeStep(
      MatchService.progressFetchMatches(
        summoner,
        queueId,
        shouldUseEpochSec ? lastGameCreationEpochSec : undefined
      )
    );
    for await (const msg of $matchesStream) yield msg;
    const matches = await $matchesResult;

    // progressFetchLeagues()
    const { stream: $leaguesStream, result: $leaguesResult } = pipeStep(
      LeagueService.progressFetchLeagues(summoner)
    );
    for await (const msg of $leaguesStream) yield msg;
    const leagues = await $leaguesResult;

    // progressFetchStats()
    const { stream: $statsStream, result: $statsResult } = pipeStep(
      SummonerRefreshService.progressFetchStats(
        summoner,
        queueType,
        leagues,
        matches
      )
    );
    for await (const msg of $statsStream) yield msg;

    yield { status: "finished" };
  }
}
