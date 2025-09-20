import type { LolQueueType } from "@/shared/types/dto/LeagueDTO";
import type { LeagueRowType } from "@/server/db/schema/league";

export type LeagueHistoryType = {
  lastest: LeagueRowType;
  history: LeagueRowType[];
};
export type LeaguesType = Record<LolQueueType, LeagueHistoryType>;
