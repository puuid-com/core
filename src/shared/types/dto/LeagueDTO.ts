import { LolTiers } from "@/shared/types/riot/common";
import * as v from "valibot";

export const LolQueues = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR"] as const;
export type LolQueueType = (typeof LolQueues)[number];

export const LeagueDTOSchema = v.object({
  leagueId: v.string(),
  queueType: v.picklist(LolQueues),
  tier: v.picklist(LolTiers),
  rank: v.string(),
  puuid: v.string(),
  leaguePoints: v.number(),
  wins: v.number(),
  losses: v.number(),
  veteran: v.boolean(),
  inactive: v.boolean(),
  freshBlood: v.boolean(),
  hotStreak: v.boolean(),
});
export type LeagueDTOType = v.InferInput<typeof LeagueDTOSchema>;

export const LeagueListDTOSchema = v.object({
  leagueId: v.string(),
  entries: v.array(v.omit(LeagueDTOSchema, ["leagueId", "queueType", "tier"])),
  tier: v.picklist(LolTiers),
  name: v.string(),
  queue: v.picklist(LolQueues),
});

export type LeagueListDTOType = v.InferOutput<typeof LeagueListDTOSchema>;
