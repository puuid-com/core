import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { LeagueRowType } from "@/server/db/schema/league";

export type LeagueHistoryType = {
  lastest: LeagueRowType;
  history: LeagueRowType[];
};
export type LeaguesType = Record<LolQueueType, LeagueHistoryType>;
