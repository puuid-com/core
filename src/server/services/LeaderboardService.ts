import { sortLeagueByLp } from "@/lib";
import { db, type TransactionType } from "@/server/db";
import {
  leaderboardEntryTable,
  leaderboardEntryTableRealtions,
  leaderboardTable,
  type InsertLeaderboardentryRowType,
  type InsertLeaderboardRowType,
  type LeaderboardEntryRowType,
  type LeaderboardRowType,
} from "@/server/db/schema/leaderboard";
import { leagueTable } from "@/server/db/schema/league";
import { summonerTable } from "@/server/db/schema/summoner";
import type { LeagueRowType } from "@/server/db/types";
import { LeagueService } from "@/server/services/league";
import type { LolApexTierType, LolQueueType, LolRegionType } from "@/shared";
import { and, asc, eq, sql } from "drizzle-orm";

export class LeaderboardService {
  static async getLeaderboard(
    tier: LolApexTierType,
    region: LolRegionType,
    queue: LolQueueType,
    date: Date
  ) {
    return db.query.leaderboardTable.findFirst({
      where: and(
        eq(leaderboardTable.tier, tier),
        eq(leaderboardTable.queue, queue),
        eq(leaderboardTable.region, region),
        eq(leaderboardTable.date, date)
      ),
      with: {
        entries: {
          orderBy: asc(leaderboardEntryTable.dayIndex),
          with: {
            league: {
              with: {
                summoner: true,
              },
            },
          },
        },
      },
    });
  }

  static async updateLeaderboard(
    tier: LolApexTierType,
    region: LolRegionType,
    queue: LolQueueType,
    date: Date
  ) {
    const leagues = await LeagueService.getLeagues(tier, region, queue);

    const data = await db.transaction(async (tx) => {
      await db
        .delete(leaderboardTable)
        .where(
          and(
            eq(leaderboardTable.tier, tier),
            eq(leaderboardTable.queue, queue),
            eq(leaderboardTable.region, region),
            eq(leaderboardTable.date, date)
          )
        );
      const leaderboard = await this.createLeaderboardTx(tx, {
        tier,
        region,
        queue,
        date,
      });

      await this.createLeaderboardEntryTx(tx, leaderboard, leagues);

      return leaderboard;
    });

    return {
      leaderboard: data,
      puuids: leagues.map((l) => l.puuid),
    };
  }

  static async createLeaderboardTx(
    tx: TransactionType,
    data: InsertLeaderboardRowType
  ) {
    const returned = await tx.insert(leaderboardTable).values(data).returning();

    const insertedData = returned.at(0);

    if (!insertedData) {
      throw new Error("createLeaderboardTx failed");
    }

    return insertedData;
  }

  static async createLeaderboard(data: InsertLeaderboardRowType) {
    return db.transaction((tx) => this.createLeaderboardTx(tx, data));
  }

  static async createLeaderboardEntry(
    leaderboard: LeaderboardRowType,
    leagues: LeagueRowType[]
  ) {
    return db.transaction((tx) =>
      this.createLeaderboardEntryTx(tx, leaderboard, leagues)
    );
  }

  static async getLastDayLeaderboard(nextDayLeaderboard: LeaderboardRowType) {
    return db.query.leaderboardTable.findFirst({
      where: and(
        eq(leaderboardTable.tier, nextDayLeaderboard.tier),
        eq(leaderboardTable.queue, nextDayLeaderboard.queue),
        eq(leaderboardTable.region, nextDayLeaderboard.region),
        eq(
          leaderboardTable.date,
          sql<Date>`cast(${nextDayLeaderboard.date} as date) - 1`
        )
      ),
      with: {
        entries: {
          columns: {
            dayIndex: true,
          },
          with: {
            league: {
              columns: {
                puuid: true,
              },
            },
          },
        },
      },
    });
  }

  static async createLeaderboardEntryTx(
    tx: TransactionType,
    leaderboard: LeaderboardRowType,
    leagues: LeagueRowType[]
  ) {
    const lastDayLeaderboard = await this.getLastDayLeaderboard(leaderboard);
    leagues = sortLeagueByLp(leagues);

    const insertValues: InsertLeaderboardentryRowType[] = leagues.map(
      (l, i) => {
        const lastDayIndex =
          lastDayLeaderboard?.entries.find((e) => e.league.puuid === l.puuid)
            ?.dayIndex ?? null;

        return {
          leaderboardId: leaderboard.id,
          leagueId: l.id,
          dayIndex: i,
          lastDayIndex: lastDayIndex,
        };
      }
    );

    const BATCH_SIZE = 2;
    const data: LeaderboardEntryRowType[] = [];

    for (let i = 0; i < insertValues.length; i += BATCH_SIZE) {
      const batch = insertValues.slice(i, i + BATCH_SIZE);
      const _data = await tx
        .insert(leaderboardEntryTable)
        .values(batch)
        .returning();

      data.push(..._data);
    }

    return data;
  }
}
