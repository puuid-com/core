import type {
  LeagueListDTOType,
  LolQueueType,
} from "@/shared/types/dto/LeagueDTO";
import {
  LeagueV4ByPuuid,
  LeagueV4Challengers,
  LeagueV4Grandmasters,
  LeagueV4Masters,
} from "@/server/api-route/riot/LeagueRoutes";
import { db, type TransactionType } from "@/server/db";
import {
  leagueTable,
  type InsertLeagueRowType,
  type LeagueRowType,
} from "@/server/db/schema/league";
import type { SummonerType } from "@/server/db/schema/summoner";
import type { LeaguesType } from "@/server/services/league/type";
import type {
  LolApexTierType,
  LolRegionType,
} from "@/shared/types/riot/common";
import { and, eq, desc, inArray, sql, or } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

export class LeagueService {
  private static async upsertLeaguesTx(
    tx: TransactionType,
    leagues: InsertLeagueRowType[]
  ) {
    const conditions = leagues.map((l) => {
      return and(
        eq(leagueTable.puuid, l.puuid),
        eq(leagueTable.queueType, l.queueType),
        eq(leagueTable.isLatest, true)
      );
    });

    await tx
      .update(leagueTable)
      .set({
        isLatest: false,
      })
      .where(or(...conditions));

    return tx
      .insert(leagueTable)
      .values(leagues)
      .onConflictDoUpdate({
        target: [
          leagueTable.puuid,
          leagueTable.queueType,
          leagueTable.createdDay,
        ],
        set: {
          isLatest: sql.raw(`excluded.${leagueTable.isLatest.name}`),
          leagueId: sql.raw(`excluded.${leagueTable.leagueId.name}`),
          leaguePoints: sql.raw(`excluded.${leagueTable.leaguePoints.name}`),
          rank: sql.raw(`excluded.${leagueTable.rank.name}`),
          tier: sql.raw(`excluded.${leagueTable.tier.name}`),
          wins: sql.raw(`excluded.${leagueTable.wins.name}`),
          losses: sql.raw(`excluded.${leagueTable.losses.name}`),
          createdAt: sql.raw(`excluded.${leagueTable.createdAt.name}`),
        },
      })
      .returning();
  }

  static async batchCacheLeaguesBySummonersTx(
    tx: TransactionType,
    summoners: Pick<SummonerType, "puuid" | "region">[]
  ) {
    const leagues = await Promise.all(
      summoners.map<Promise<InsertLeagueRowType[]>>(async (summoner) => {
        const league = await LeagueV4ByPuuid.call({
          puuid: summoner.puuid,
          region: summoner.region,
        });

        return league.map((l) => ({
          ...l,
          region: summoner.region,
        }));
      })
    );

    const flattened = leagues.flat();

    if (flattened.length === 0) return {};

    const newLeagues = await this.upsertLeaguesTx(tx, flattened);

    return summoners.reduce((acc, summoner) => {
      const summonerLeagues = newLeagues.filter(
        (l) => l.puuid === summoner.puuid
      );

      acc[summoner.puuid] = summonerLeagues;

      return acc;
    }, {} as Record<SummonerType["puuid"], LeagueRowType[]>);
  }

  static async cacheLeaguesTx(
    tx: TransactionType,
    id: Pick<SummonerType, "puuid" | "region">
  ): Promise<LeagueRowType[]> {
    const data = await LeagueV4ByPuuid.call({
      region: id.region,
      puuid: id.puuid,
    });

    if (data.length === 0) return [];

    return this.upsertLeaguesTx(
      tx,
      data.map((d) => ({
        ...d,
        region: id.region,
      }))
    );
  }

  static async getLeaguesTx(
    tx: TransactionType,
    summoner: Pick<SummonerType, "region" | "puuid">
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

  static async getLeagues(
    tier: LolApexTierType,
    region: LolRegionType,
    queue: LolQueueType
  ) {
    let leagues: LeagueListDTOType;

    switch (tier) {
      case "MASTER":
        leagues = await LeagueV4Masters.call({ queue, region });
        break;
      case "GRANDMASTER":
        leagues = await LeagueV4Grandmasters.call({ queue, region });
        break;
      case "CHALLENGER":
        leagues = await LeagueV4Challengers.call({ queue, region });
        break;
    }

    const data = leagues.entries.map<InsertLeagueRowType>((e) => ({
      ...e,
      queueType: queue,
      tier: tier,
      region: region,
    }));
    const inserted: LeagueRowType[] = [];

    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      const newLeagues = await db.transaction((tx) =>
        this.upsertLeaguesTx(tx, batch)
      );

      inserted.push(...newLeagues);
    }

    return inserted;
  }
}
