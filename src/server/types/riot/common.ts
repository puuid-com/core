import { string, regex, pipe, trim, type InferOutput } from "valibot";

export const LolRegions = [
  "na1",
  "br1",
  "la1",
  "la2",
  "euw1",
  "eun1",
  "tr1",
  "ru",
  "kr",
  "jp1",
  "oc1",
  "ph2",
  "sg2",
  "th2",
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
    ph2: "sea",
    sg2: "sea",
    th2: "sea",
    tw2: "sea",
    vn2: "sea",
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

export const LolRanks = ["IV", "III", "II", "I"] as const;
export type LolRankType = (typeof LolRanks)[number];
