import type { TransactionType } from "@/server/db";
import {
  summonerStatisticTable,
  type InsertSummonerStatisticRowType,
  type SummonerStatisticRowType,
} from "@/server/db/schema/summoner-statistic";
import type { MatchWithSummonersType, SummonerType } from "@/server/db/types";
import { averageBy, maxItemBy } from "@/server/lib";
import type { LolQueueType } from "@/shared/types/dto/LeagueDTO";
import { uuidv7 } from "uuidv7";

export type Stat = {
  wins: number;
  losses: number;
  kills: number;
  assists: number;
  deaths: number;
};

type StatsToRefresh = Pick<
  InsertSummonerStatisticRowType,
  | "statsByChampionId"
  | "statsByPosition"
  | "statsByOppositePositionChampionId"
  | "statsByTeammates"
  | "kills"
  | "assists"
  | "deaths"
> & {
  averageAssistPerGame: number[];
  averageDeathPerGame: number[];
  averageKda: number[];
  averageKillPerGame: number[];
  wins: number;
  losses: number;
};

const sortByMatches = (a: Stat, b: Stat) => {
  const aTotal = a.losses + a.wins;
  const bTotal = b.losses + b.wins;

  return bTotal - aTotal;
};

export class SummonerStatisticService {
  static RECENT_STATISTIC_MATCHES_COUNT = 10;

  static createSummonerStatistic(
    puuid: SummonerType["puuid"],
    cachedMatches: MatchWithSummonersType[]
  ): SummonerStatisticRowType | null {
    const matches = cachedMatches.filter((m) => m.resultType === "NORMAL");

    console.log({
      puuid,
      matches: matches.map((m) => ({ id: m.matchId, r: m.resultType })),
    });

    if (!matches.length) {
      return null;
    }

    const _stats: StatsToRefresh = {
      statsByChampionId: [],
      statsByPosition: [],
      statsByOppositePositionChampionId: [],
      kills: 0,
      assists: 0,
      deaths: 0,
      averageAssistPerGame: [],
      averageDeathPerGame: [],
      averageKda: [],
      averageKillPerGame: [],
      statsByTeammates: [],
      wins: 0,
      losses: 0,
    };

    const stats = matches.reduce((acc, curr) => {
      const mainSummoner = curr.summoners.find((s) => s.puuid === puuid);
      if (!mainSummoner) return acc;

      const vs = curr.summoners.find(
        (s) => s.puuid === mainSummoner.vsSummonerPuuid
      );
      if (!vs) return acc;

      const incWins = mainSummoner.win ? 1 : 0;
      const incLosses = mainSummoner.win ? 0 : 1;

      acc.kills += mainSummoner.kills;
      acc.assists += mainSummoner.assists;
      acc.deaths += mainSummoner.deaths;

      acc.wins += incWins;
      acc.losses += incLosses;

      {
        const s = acc.statsByChampionId.find(
          (s) => s.championId === mainSummoner.championId
        );
        if (!s) {
          acc.statsByChampionId.push({
            championId: mainSummoner.championId,
            kills: mainSummoner.kills,
            assists: mainSummoner.assists,
            deaths: mainSummoner.deaths,
            wins: incWins,
            losses: incLosses,
          });
        } else {
          s.kills += mainSummoner.kills;
          s.assists += mainSummoner.assists;
          s.deaths += mainSummoner.deaths;
          s.wins += incWins;
          s.losses += incLosses;
        }
      }

      {
        const s = acc.statsByPosition.find(
          (s) => s.position === mainSummoner.position
        );
        if (!s) {
          acc.statsByPosition.push({
            position: mainSummoner.position,
            kills: mainSummoner.kills,
            assists: mainSummoner.assists,
            deaths: mainSummoner.deaths,
            wins: incWins,
            losses: incLosses,
          });
        } else {
          s.kills += mainSummoner.kills;
          s.assists += mainSummoner.assists;
          s.deaths += mainSummoner.deaths;
          s.wins += incWins;
          s.losses += incLosses;
        }
      }

      {
        const s = acc.statsByOppositePositionChampionId.find(
          (s) => s.championId === vs.championId
        );
        if (!s) {
          acc.statsByOppositePositionChampionId.push({
            championId: vs.championId,
            kills: mainSummoner.kills,
            assists: mainSummoner.assists,
            deaths: mainSummoner.deaths,
            wins: incWins,
            losses: incLosses,
          });
        } else {
          s.kills += mainSummoner.kills;
          s.assists += mainSummoner.assists;
          s.deaths += mainSummoner.deaths;
          s.wins += incWins;
          s.losses += incLosses;
        }
      }

      {
        curr.summoners.forEach((summoner) => {
          if (
            mainSummoner.teamId !== summoner.teamId ||
            summoner.puuid === mainSummoner.puuid
          )
            return;

          const _s = acc.statsByTeammates.find(
            (s) => summoner.puuid === s.puuid
          );

          if (!_s) {
            acc.statsByTeammates.push({
              puuid: summoner.puuid,
              wins: incWins,
              losses: incLosses,
            });
          } else {
            _s.wins += incWins;
            _s.losses += incLosses;
          }
        });
      }

      acc.averageAssistPerGame.push(mainSummoner.assists);
      acc.averageDeathPerGame.push(mainSummoner.deaths);
      acc.averageKda.push(
        (mainSummoner.kills + mainSummoner.assists) /
          Math.max(1, mainSummoner.deaths)
      );
      acc.averageKillPerGame.push(mainSummoner.kills);

      return acc;
    }, _stats);

    const mainChampionId = maxItemBy(
      stats.statsByChampionId,
      (item) => item.losses + item.wins
    ).championId;

    const statsToInsert: SummonerStatisticRowType = {
      id: uuidv7(),
      puuid: puuid,
      statsByChampionId: stats.statsByChampionId.sort(sortByMatches),
      statsByPosition: stats.statsByPosition.sort(sortByMatches),
      statsByOppositePositionChampionId:
        stats.statsByOppositePositionChampionId.sort(sortByMatches),
      kills: stats.kills,
      assists: stats.assists,
      deaths: stats.deaths,
      averageAssistPerGame: averageBy(
        stats.averageAssistPerGame,
        (item) => item
      ),
      averageDeathPerGame: averageBy(stats.averageDeathPerGame, (item) => item),
      averageKda: averageBy(stats.averageKda, (item) => item),
      averageKillPerGame: averageBy(stats.averageKillPerGame, (item) => item),

      statsByTeammates: stats.statsByTeammates
        .sort((a, b) => {
          const aTotal = a.losses + a.wins;
          const bTotal = b.losses + b.wins;

          return bTotal - aTotal;
        })
        .filter((s) => s.wins + s.losses > 2)
        .slice(0, 5),

      mainChampionId: mainChampionId,

      mainPosition: maxItemBy(
        stats.statsByPosition,
        (item) => item.losses + item.wins
      ).position,

      wins: stats.wins,
      losses: stats.losses,

      createdAt: new Date(),
    };

    return statsToInsert;
  }

  static async insertSummonerStatisticsTx(
    tx: TransactionType,
    puuids: SummonerType["puuid"][],
    matches: Record<SummonerType["puuid"], MatchWithSummonersType[]>
  ) {
    console.log("insertSummonerStatisticsTx", puuids);

    const fullStatistics = puuids.map((puuid) =>
      this.createSummonerStatistic(puuid, matches[puuid]!)
    );

    const recentStatistics = puuids.map((puuid) =>
      this.createSummonerStatistic(
        puuid,
        matches[puuid]!.slice(0, this.RECENT_STATISTIC_MATCHES_COUNT)
      )
    );

    const insertValues = [...fullStatistics, ...recentStatistics].filter(
      Boolean
    ) as SummonerStatisticRowType[];

    if (insertValues.length) {
      await tx.insert(summonerStatisticTable).values(insertValues);
    }

    return puuids.map((puuid) => {
      return {
        puuid,
        summonerStatistic: fullStatistics.find((s) => s?.puuid === puuid),
        recentSummonerStatistic: recentStatistics.find(
          (s) => s?.puuid === puuid
        ),
      };
    });
  }
}
