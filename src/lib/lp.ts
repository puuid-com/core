import type { LeagueRowType } from "@/server/db/schema/league";
import type { LolRankType, LolTierType } from "@/shared/types";

const RANK_OFFSETS: Record<LolRankType, number> = {
  IV: 0,
  III: 100,
  II: 200,
  I: 300,
};

export const LeagueTierOrder: readonly LolTierType[] = [
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
];

const DIVISIONS_PER_TIER = Object.keys(RANK_OFFSETS).length; // 4 divisions
const LP_PER_DIVISION = 100;
const LP_PER_TIER = DIVISIONS_PER_TIER * LP_PER_DIVISION; // 400 LP span per tier up to Master
const DIAMOND_INDEX = LeagueTierOrder.indexOf("DIAMOND");
const MASTER_INDEX = LeagueTierOrder.indexOf("MASTER");
const MASTER_BASE = (DIAMOND_INDEX + 1) * LP_PER_TIER; // 2800 LP baseline for Master 0 LP

export const tierToBaseNormalizedLp = (tier: LolTierType) => {
  const tierIndex = LeagueTierOrder.indexOf(tier);
  if (tierIndex === -1) return 0;

  if (tierIndex < MASTER_INDEX) {
    return tierIndex * LP_PER_TIER;
  }

  const tierOffset = tierIndex - MASTER_INDEX;
  return MASTER_BASE + 1 + tierOffset * LP_PER_TIER;
};

export const LeagueToLP = (league: LeagueRowType) => {
  const { leaguePoints, rank, tier } = league;
  const tierIndex = LeagueTierOrder.indexOf(tier);

  if (tierIndex === -1) return leaguePoints;

  const base = tierToBaseNormalizedLp(tier);

  if (tierIndex < MASTER_INDEX) {
    const rankKey = (rank && rank in RANK_OFFSETS ? rank : "IV") as LolRankType;
    const rankOffset = RANK_OFFSETS[rankKey] ?? 0;
    return base + rankOffset + leaguePoints;
  }

  return base + leaguePoints;
};

export const sortLeagueByLp = (
  leagues: LeagueRowType[],
  direction: "asc" | "desc" = "desc"
) => {
  const sign = direction === "asc" ? 1 : -1;

  const keyed = leagues.map<{
    item: LeagueRowType;
    lp: number;
    winrate: number;
    i: number;
  }>((item, i) => {
    const games = item.wins + item.losses;
    const winrate = games > 0 ? item.wins / games : 0;
    return { item, lp: LeagueToLP(item), winrate, i };
  });

  keyed.sort((a, b) => {
    let d = sign * (a.lp - b.lp);
    if (d !== 0) return d;

    d = b.winrate - a.winrate;
    if (d !== 0) return d;

    if (a.item.puuid < b.item.puuid) return -1;
    if (a.item.puuid > b.item.puuid) return 1;

    return a.i - b.i;
  });

  return keyed.map((k) => k.item);
};
