import { string, regex, pipe, trim, type InferOutput } from "valibot";

export const LolRegions = [
  "br1",
  "eun1",
  "euw1",
  "jp1",
  "kr",
  "la1",
  "la2",
  "me1",
  "na1",
  "oc1",
  "ru",
  "sg2",
  "tr1",
  "tw2",
  "vn2",
] as const;

export type LolRegionType = (typeof LolRegions)[number];

export const LolRoutingValues = ["americas", "europe", "asia", "sea"] as const;

export type LolRoutingValueType = (typeof LolRoutingValues)[number];

export const RiotIdSchema = pipe(string(), trim(), regex(/.*#.*/));
export type RiotIdSchemaType = InferOutput<typeof RiotIdSchema>;

export function routingValueFromRegion(
  region: LolRegionType
): LolRoutingValueType {
  const platformToRegionMap: Record<LolRegionType, LolRoutingValueType> = {
    na1: "americas",
    br1: "americas",
    la1: "americas",
    la2: "americas",
    euw1: "europe",
    eun1: "europe",
    tr1: "europe",
    ru: "europe",
    kr: "asia",
    jp1: "asia",
    oc1: "sea",
    sg2: "sea",
    tw2: "sea",
    vn2: "sea",
    me1: "americas",
  };

  return platformToRegionMap[region];
}

export const LolTiers = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;
export type LolTierType = (typeof LolTiers)[number];

export const LolHighTiers = ["MASTER", "GRANDMASTER", "CHALLENGER"] as const;
export type LolHighTierType = (typeof LolHighTiers)[number];

export const LolRanks = ["IV", "III", "II", "I"] as const;
export type LolRankType = (typeof LolRanks)[number];
