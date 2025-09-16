import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { LeagueV4ByPuuid } from "@/server/api-route/riot/league/LeagueRoutes";
import { db, type TransactionType } from "@/server/db";
import {
  leagueTable,
  type InsertLeagueRowType,
  type LeagueRowType,
} from "@/server/db/schema/league";
import type { SummonerType } from "@/server/db/schema/summoner";
import type { LeaguesType } from "@/server/services/league/type";
import type { LolRegionType } from "@/server/types/riot/common";
import { and, eq, desc, inArray, sql, or } from "drizzle-orm";

export class LeagueService {
  private static async upsertLeaguesTx(tx: TransactionType, leagues: InsertLeagueRowType[]) {
    const conditions = leagues.map((l) => {
      return and(
        eq(leagueTable.puuid, l.puuid),
        eq(leagueTable.queueType, l.queueType),
        eq(leagueTable.isLatest, true),
      );
    });

    await tx
      .update(leagueTable)
      .set({
        isLatest: false,
      })
      .where(or(...conditions));

    return tx.insert(leagueTable).values(leagues).returning();
  }

  static async batchCacheLeaguesBySummonersTx(tx: TransactionType, summoners: SummonerType[]) {
    const leagues = await Promise.all(
      summoners.map((summoner) =>
        LeagueV4ByPuuid.call({ puuid: summoner.puuid, region: summoner.region }),
      ),
    );

    const flattened = leagues.flat();

    if (flattened.length === 0) return [];

    return this.upsertLeaguesTx(
      tx,
      flattened.map((l) => ({
        isLatest: true,
        ...l,
      })),
    );
  }

  static async cacheLeaguesTx(
    tx: TransactionType,
    id: Pick<SummonerType, "puuid" | "region">,
  ): Promise<LeagueRowType[]> {
    const data = await LeagueV4ByPuuid.call({
      region: id.region,
      puuid: id.puuid,
    });

    if (data.length === 0) return [];

    return this.upsertLeaguesTx(
      tx,
      data.map((l) => ({
        isLatest: true,
        ...l,
      })),
    );
  }

  static async getLeaguesTx(
    tx: TransactionType,
    summoner: Pick<SummonerType, "region" | "puuid">,
  ): Promise<LeaguesType> {
    const cachedLeagues = await tx
      .select()
      .from(leagueTable)
      .where(and(eq(leagueTable.puuid, summoner.puuid)))
      .orderBy(leagueTable.queueType, desc(leagueTable.createdAt));

    return cachedLeagues.reduce((acc, league) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!acc[league.queueType]) {
        acc[league.queueType] = {
          lastest: league,
          history: [],
        };
      } else {
        acc[league.queueType].history.push(league);
      }

      return acc;
    }, {} as LeaguesType);
  }

  static async getLeaguesByPuuids(
    puuids: SummonerType["puuid"][],
    queueType: LolQueueType,
    region: LolRegionType,
  ) {
    const cached = await db.query.leagueTable.findMany({
      where: and(
        inArray(leagueTable.puuid, puuids),
        eq(leagueTable.queueType, queueType),
        eq(leagueTable.isLatest, true),
        sql`${leagueTable.createdAt} >= NOW() - INTERVAL '12 hours'`,
      ),
    });

    const notCached = puuids.filter((puuid) => !cached.some((l) => l.puuid === puuid));

    if (!notCached.length) return cached;

    const newLeagues = await Promise.all(
      notCached.map((puuid) => {
        return LeagueV4ByPuuid.call({ region, puuid });
      }),
    );

    const newLeagueRows = await db.transaction((tx) =>
      this.upsertLeaguesTx(
        tx,
        newLeagues.flat().map((l) => ({
          isLatest: true,
          ...l,
        })),
      ),
    );

    cached.push(...newLeagueRows.filter((l) => l.queueType === queueType));

    return cached;
  }
}
