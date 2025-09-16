import { LolTiers } from "@/server/types/riot/common";
import * as v from "valibot";

export const LolQueues = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR"] as const;
export type LolQueueType = (typeof LolQueues)[number];

export const LeagueDTOSchema = v.object({
  leagueId: v.string(),
  queueType: v.picklist(LolQueues),
  tier: v.picklist(LolTiers),
  rank: v.optional(v.string()),
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
