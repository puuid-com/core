import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { db, type TransactionType } from "@/server/db";
import type { MatchWithSummonersType } from "@/server/db/schema/match";
import { averageBy, maxItemBy } from "@/server/lib";
import { upsert } from "@/server/lib/drizzle";
import { and, eq, inArray } from "drizzle-orm";
import type { LeagueRowType } from "@/server/db/schema/league";
import type { SummonerType } from "@/server/db/schema/summoner";
import {
  statisticTable,
  type InsertStatisticRowType,
  type StatisticRowType,
  type StatisticWithLeagueType,
} from "@/server/db/schema/summoner-statistic";
import { ServerColorsService } from "@/server/services/ServerColorsService";
import { LeagueService } from "@/server/services/league/LeagueService";
import { MatchService } from "@/server/services/match/MatchService";
import { LOL_QUEUES } from "@/server/services/match/queues";

export type Stat = {
  wins: number;
  losses: number;
  kills: number;
  assists: number;
  deaths: number;
};

type StatsToRefresh = Pick<
  InsertStatisticRowType,
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

export class StatisticService {
  // 2 days
  private static TIME_BEFORE_FORCED_REFRESH = 2 * 24 * 60 * 60 * 1000;

  static getSummonerStatistics(puuid: SummonerType["puuid"]) {
    return db.query.statisticTable.findMany({
      where: eq(statisticTable.puuid, puuid),
      with: {
        league: true,
      },
    });
  }
  static MATCHES_COUNTED = 9999;

  static async getSummonerStatisticWithLeague(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType,
  ): Promise<StatisticWithLeagueType | undefined> {
    return db.query.statisticTable.findFirst({
      where: and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)),
      with: {
        league: true,
      },
    });
  }

  static async getSummonerStatistic(puuid: SummonerType["puuid"], queueType: LolQueueType) {
    return db.query.statisticTable.findFirst({
      where: and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)),
    });
  }

  public static async getSummonersStatisticWithLeagye(
    puuids: SummonerType["puuid"][],
    queueType: LolQueueType,
  ) {
    return db.query.statisticTable.findMany({
      where: and(eq(statisticTable.queueType, queueType), inArray(statisticTable.puuid, puuids)),
      with: {
        league: true,
      },
    });
  }

  static shouldRefreshStatistic(statistic: StatisticRowType) {
    return Date.now() - statistic.refreshedAt.getTime() > this.TIME_BEFORE_FORCED_REFRESH;
  }

  static async batchRefreshSummonerStatitisticsTx(
    tx: TransactionType,
    summonersData: {
      summoner: SummonerType;
      matches: MatchWithSummonersType[];
    }[],
    queueType: LolQueueType,
    forceRefresh: boolean,
  ) {
    const oldStats = await this.getSummonersStatisticWithLeagye(
      summonersData.map((data) => data.summoner.puuid),
      queueType,
    );

    const oldStatsToKeep: StatisticWithLeagueType[] = [];

    if (!forceRefresh) {
      oldStatsToKeep.push(...oldStats.filter((s) => !this.shouldRefreshStatistic(s)));
    }

    if (oldStatsToKeep.length !== summonersData.length) {
      const notMissingPuuids = oldStatsToKeep.map((s) => s.puuid);
      const missingSummoners = summonersData.filter(
        (data) => !notMissingPuuids.includes(data.summoner.puuid),
      );

      const leagues = await LeagueService.batchCacheLeaguesBySummonersTx(
        tx,
        missingSummoners.map((d) => d.summoner),
      );

      const createdStatistics = await Promise.all(
        missingSummoners.map((data) =>
          this.createSummonerStatistic(
            data.summoner,
            queueType,
            leagues.filter((l) => l.puuid === data.summoner.puuid),
            data.matches,
            undefined,
          ),
        ),
      );

      await this.saveSummonerStatisticsTx(
        tx,
        createdStatistics.map((s) => s._toInsert).filter((s) => s !== null),
      );
      oldStatsToKeep.push(...createdStatistics.map((s) => s.stats).filter((s) => s !== null));
    }

    return {
      statistics: oldStatsToKeep,
    };
  }

  private static async saveSummonerStatisticsTx(
    tx: TransactionType,
    statistics: InsertStatisticRowType[],
  ) {
    return await tx
      .insert(statisticTable)
      .values(statistics)
      .onConflictDoUpdate({
        target: [statisticTable.puuid, statisticTable.queueType],
        set: upsert(statisticTable),
      });
  }

  static async refreshSummonerStatisticTx(
    tx: TransactionType,
    summoner: Pick<SummonerType, "region" | "puuid">,
    queueType: LolQueueType,
    forceRefresh: boolean,
    cachedLeagues?: LeagueRowType[],
    cachedMatches?: MatchWithSummonersType[],
  ) {
    const oldStats = await this.getSummonerStatistic(summoner.puuid, queueType);
    const oldStatsRefreshedAt = oldStats?.refreshedAt;

    if (
      oldStats &&
      !forceRefresh &&
      oldStatsRefreshedAt &&
      !this.shouldRefreshStatistic(oldStats)
    ) {
      return {
        stats: oldStats,
        lastMatch: undefined,
      };
    }

    cachedLeagues ??= await LeagueService.cacheLeaguesTx(tx, summoner);
    cachedMatches ??= await MatchService.getMatchesDBByPuuidFull(
      summoner,
      {
        count: this.MATCHES_COUNTED,
        queue: LOL_QUEUES[queueType].queueId,
      },
      "NORMAL",
    );

    const stats = await this.createSummonerStatistic(
      summoner,
      queueType,
      cachedLeagues,
      cachedMatches,
      oldStats,
    );

    if (stats._toInsert) await this.saveSummonerStatisticsTx(tx, [stats._toInsert]);

    return {
      stats: stats.stats,
      lastMatch: stats.lastMatch,
    };
  }

  private static async createSummonerStatistic(
    summoner: Pick<SummonerType, "region" | "puuid">,
    queueType: LolQueueType,
    cachedLeagues: LeagueRowType[],
    cachedMatches: MatchWithSummonersType[],
    oldStats: StatisticRowType | undefined,
  ): Promise<{
    stats: StatisticWithLeagueType | null;
    lastMatch: MatchWithSummonersType | undefined;
    _toInsert: StatisticRowType | null;
  }> {
    const matches = cachedMatches.filter((m) => m.resultType === "NORMAL");

    if (!matches.length) {
      return {
        stats: null,
        lastMatch: undefined,
        _toInsert: null,
      };
    }

    const league = cachedLeagues.find((l) => l.queueType === queueType) ?? null;

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
      const mainSummoner = curr.summoners.find((s) => s.puuid === summoner.puuid);
      if (!mainSummoner) return acc;

      const vs = curr.summoners.find((s) => s.puuid === mainSummoner.vsSummonerPuuid);
      if (!vs) return acc;

      const incWins = mainSummoner.win ? 1 : 0;
      const incLosses = mainSummoner.win ? 0 : 1;

      acc.kills += mainSummoner.kills;
      acc.assists += mainSummoner.assists;
      acc.deaths += mainSummoner.deaths;

      acc.wins += incWins;
      acc.losses += incLosses;

      {
        const s = acc.statsByChampionId.find((s) => s.championId === mainSummoner.championId);
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

      // statsByIndividualPosition, incrémente ou crée
      {
        const s = acc.statsByPosition.find((s) => s.position === mainSummoner.position);
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

      // statsByOppositeIndividualPositionChampionId, incrémente ou crée
      {
        const s = acc.statsByOppositePositionChampionId.find((s) => s.championId === vs.championId);
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
          if (mainSummoner.teamId !== summoner.teamId || summoner.puuid === mainSummoner.puuid)
            return;

          const _s = acc.statsByTeammates.find((s) => summoner.puuid === s.puuid);

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
        (mainSummoner.kills + mainSummoner.assists) / Math.max(1, mainSummoner.deaths),
      );
      acc.averageKillPerGame.push(mainSummoner.kills);

      return acc;
    }, _stats);

    const mainChampionId = maxItemBy(
      stats.statsByChampionId,
      (item) => item.losses + item.wins,
    ).championId;

    const sameMainChampion = oldStats?.mainChampionId === mainChampionId;

    const {
      backgroundColor: mainChampionBackgroundColor,
      foregroundColor: mainChampionForegroundColor,
    } = sameMainChampion
      ? {
          backgroundColor: oldStats.mainChampionBackgroundColor,
          foregroundColor: oldStats.mainChampionForegroundColor,
        }
      : await ServerColorsService.getMainColorsFromChampion(mainChampionId);

    const mainChampionSkinId = sameMainChampion ? oldStats.mainChampionSkinId : undefined;

    const statsToInsert: StatisticRowType = {
      puuid: summoner.puuid,
      statsByChampionId: stats.statsByChampionId.sort(sortByMatches),
      statsByPosition: stats.statsByPosition.sort(sortByMatches),
      statsByOppositePositionChampionId:
        stats.statsByOppositePositionChampionId.sort(sortByMatches),
      kills: stats.kills,
      assists: stats.assists,
      deaths: stats.deaths,
      averageAssistPerGame: averageBy(stats.averageAssistPerGame, (item) => item),
      averageDeathPerGame: averageBy(stats.averageDeathPerGame, (item) => item),
      averageKda: averageBy(stats.averageKda, (item) => item),
      averageKillPerGame: averageBy(stats.averageKillPerGame, (item) => item),
      queueType,
      latestLeagueEntryId: league?.id ?? null,

      statsByTeammates: stats.statsByTeammates
        .sort((a, b) => {
          const aTotal = a.losses + a.wins;
          const bTotal = b.losses + b.wins;

          return bTotal - aTotal;
        })
        .filter((s) => s.wins + s.losses > 2)
        .slice(0, 5),

      mainChampionId: mainChampionId,
      mainChampionForegroundColor: mainChampionForegroundColor ?? null,
      mainChampionBackgroundColor: mainChampionBackgroundColor ?? null,
      mainChampionSkinId: mainChampionSkinId ?? 0,

      mainPosition: maxItemBy(stats.statsByPosition, (item) => item.losses + item.wins).position,

      wins: stats.wins,
      losses: stats.losses,

      refreshedAt: new Date(),
    };

    return {
      stats: {
        ...statsToInsert,
        league: cachedLeagues.find((l) => l.id === statsToInsert.latestLeagueEntryId) ?? null,
      },
      lastMatch: matches.at(0),
      _toInsert: statsToInsert,
    };
  }

  static async changeMainChampionColors(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType,
    skinId: number,
  ) {
    const stats = await db.query.statisticTable.findFirst({
      where: and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)),
    });

    if (!stats) {
      throw new Error("No statistic found");
    }

    let mainChampionBackgroundColor: string | undefined;
    let mainChampionForegroundColor: string | undefined;

    try {
      const { backgroundColor, foregroundColor } =
        await ServerColorsService.getMainColorsFromChampionSkin(stats.mainChampionId, skinId);

      mainChampionBackgroundColor = backgroundColor;
      mainChampionForegroundColor = foregroundColor;
    } catch (e) {
      console.error(e);

      throw new Error("Failed to get colors");
    }

    return db
      .update(statisticTable)
      .set({
        mainChampionBackgroundColor,
        mainChampionForegroundColor,
        mainChampionSkinId: skinId,
      })
      .where(and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)))
      .returning();
  }
}
