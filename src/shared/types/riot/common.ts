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

export const LolRegionTimezones: Record<LolRegionType, string> = {
  br1: "America/Sao_Paulo",
  eun1: "Europe/Warsaw",
  euw1: "Europe/Paris",
  jp1: "Asia/Tokyo",
  kr: "Asia/Seoul",
  la1: "America/Mexico_City",
  la2: "America/Santiago",
  me1: "Asia/Dubai",
  na1: "America/Los_Angeles",
  oc1: "Australia/Sydney",
  ru: "Europe/Moscow",
  sg2: "Asia/Singapore",
  tr1: "Europe/Istanbul",
  tw2: "Asia/Taipei",
  vn2: "Asia/Ho_Chi_Minh",
};

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

export const LolApexTiers = ["MASTER", "GRANDMASTER", "CHALLENGER"] as const;
export type LolApexTierType = (typeof LolApexTiers)[number];

export const LolRanks = ["IV", "III", "II", "I"] as const;
export type LolRankType = (typeof LolRanks)[number];
