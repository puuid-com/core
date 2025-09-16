import { db, type TransactionType } from "@/server/db";
import type {
  AccountDTOType,
  AccountRegionDTOType,
} from "@/server/api-route/riot/account/AccountDTO";
import { AccountService } from "@/server/services/AccountService";
import { getPartsFromRiotID } from "@/server/services/summoner/utils";
import { SummonerDTOService } from "@/server/services/SummonrtDTOService";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { normalizeRiotID, trimRiotID } from "@/lib/riotID";
import type { SummonerDTOType } from "@/server/api-route/riot/summoner/SummonerDTO";
import {
  summonerTable,
  type SummonerType,
  type SummonerWithRelationsType,
  type InsertSummonerType,
} from "@/server/db/schema/summoner";
import type { User } from "better-auth";
import { noteTable } from "@/server/db/schema/note";

export class SummonerService {
  static async getSummonersWithRelations(search?: string) {
    const norm = search ? normalizeRiotID(search) : "";
    const whereClause = norm ? ilike(summonerTable.normalizedRiotId, `%${norm}%`) : undefined;

    return db.query.summonerTable.findMany({
      where: whereClause,
      with: {
        statistics: true,
        leagues: true,
      },
      limit: 25,
      orderBy: [summonerTable.region, desc(summonerTable.summonerLevel)],
    });
  }

  static async getSummoners(
    options: { search?: string; limit?: number; userId?: User["id"] } = {},
  ) {
    const { search, limit = 25, userId } = options;

    const norm = search ? normalizeRiotID(search) : "";
    const pattern = norm ? `%${norm}%` : undefined;
    const prefixPattern = norm ? `${norm}%` : undefined;

    // Adaptive threshold for short inputs
    const jwThreshold = norm ? (norm.length <= 3 ? 0.6 : norm.length <= 4 ? 0.68 : 0.75) : 0.0;

    // Join only the current user's note, otherwise no-op join
    const joinOn =
      userId !== undefined
        ? and(eq(noteTable.puuid, summonerTable.puuid), eq(noteTable.userId, userId))
        : sql`false`;

    // Fuzzy note predicate for WHERE (only when we have a term and a user)
    const noteFuzzyHit =
      norm && userId !== undefined
        ? sql<boolean>`jarowinkler(${noteTable.note}, ${norm}) >= ${jwThreshold}`
        : sql<boolean>`false`;

    // Build the OR filter, summoner id substring OR fuzzy note match
    const whereClause = pattern
      ? or(ilike(summonerTable.normalizedRiotId, pattern), noteFuzzyHit)
      : undefined;

    // Similarities for ranking
    const simNote =
      norm && userId !== undefined
        ? sql<number>`COALESCE(jarowinkler(${noteTable.note}, ${norm}), 0)`
        : sql<number>`0`;

    const simId = norm
      ? sql<number>`jarowinkler(${summonerTable.normalizedRiotId}, ${norm})`
      : sql<number>`0`;

    // Priority scoring
    // 1) any fuzzy note hit gets a large bucket boost
    // 2) within those, sort by note similarity
    // 3) then use Riot ID similarity, with a tiny prefix boost
    const score = sql<number>`
    (CASE WHEN ${noteFuzzyHit} THEN 100 ELSE 0 END)
    + (${simNote} * 10)
    + ${simId}
    + (CASE WHEN ${prefixPattern ? sql`${summonerTable.normalizedRiotId} ILIKE ${prefixPattern}` : sql`false`} THEN 1 ELSE 0 END)
  `;

    return db
      .select()
      .from(summonerTable)
      .leftJoin(noteTable, joinOn)
      .where(whereClause) // inferred type fits .where()
      .orderBy(desc(score), summonerTable.region, desc(summonerTable.summonerLevel))
      .limit(limit);
  }

  static async getSummonerByPuuidTx(
    tx: TransactionType,
    puuid: SummonerType["puuid"],
  ): Promise<SummonerWithRelationsType | undefined> {
    return tx.query.summonerTable.findFirst({
      where: eq(summonerTable.puuid, puuid),
      with: {
        statistics: {
          with: {
            league: true,
          },
        },
        leagues: true,
        refresh: true,
      },
    });
  }

  static async getOrCreateSummonerByRiotIDTx(
    tx: TransactionType,
    clientRiotID: SummonerType["riotId"],
    refresh = false,
  ): Promise<SummonerWithRelationsType> {
    const { riotId, gameName, tagLine } = getPartsFromRiotID(clientRiotID);

    const cachedData = refresh
      ? undefined
      : await tx.query.summonerTable.findFirst({
          where: eq(summonerTable.riotId, riotId),
          with: {
            statistics: {
              with: {
                league: true,
              },
            },
            leagues: true,
            refresh: true,
          },
        });

    if (cachedData && !refresh) {
      return cachedData;
    }

    const account = await AccountService.getAccountByRiotID({ gameName, tagLine });
    const accountRegion = await AccountService.getAccountRegion(account.puuid);

    return this.handleSummonerCreationFromAccountTx(tx, account, accountRegion);
  }

  static async getOrCreateSummonerByPuuidTx(
    tx: TransactionType,
    puuid: SummonerType["puuid"],
    refresh = false,
  ): Promise<SummonerType> {
    const cachedRows = await tx
      .select()
      .from(summonerTable)
      .where(eq(summonerTable.puuid, puuid))
      .limit(1);

    const cachedData = cachedRows.length === 1 ? cachedRows[0] : null;

    if (cachedData && !refresh) {
      return cachedData;
    }

    const account = await AccountService.getAccountByPuuid({ puuid });
    const accountRegion = await AccountService.getAccountRegion(account.puuid);

    return this.handleSummonerCreationFromAccountTx(tx, account, accountRegion);
  }

  static async getOrCreateSummonersByPuuids(puuids: SummonerType["puuid"][]) {
    const cached = await db.query.summonerTable.findMany({
      where: inArray(summonerTable.puuid, puuids),
    });

    const notCached = puuids.filter((puuid) => !cached.some((s) => s.puuid === puuid));

    if (notCached.length === 0) {
      return cached;
    }

    const accounts = await Promise.all(
      notCached
        .map((puuid) =>
          Promise.all([
            AccountService.getAccountByPuuid({ puuid }),
            AccountService.getAccountRegion(puuid),
          ]),
        )
        .flat(),
    );

    const dataByPuuid = accounts.flat().reduce<
      {
        puuid: SummonerType["puuid"];
        account: AccountDTOType;
        accountRegion: AccountRegionDTOType;
      }[]
    >((acc, curr) => {
      const _s = acc.find((s) => s.puuid === curr.puuid);
      const region = "region" in curr ? curr : undefined;
      const account = "gameName" in curr ? curr : undefined;

      if (!_s) {
        acc.push({
          puuid: curr.puuid,
          account: account!,
          accountRegion: region!,
        });
      } else {
        if (region) _s.accountRegion = region;
        if (account) _s.account = account;
      }

      return acc;
    }, []);

    const summonersDTO = await Promise.all(
      dataByPuuid.map((d) =>
        SummonerDTOService.getSummonerDTOByPuuid({
          puuid: d.puuid,
          region: d.accountRegion.region,
        }),
      ),
    );

    const summoners: InsertSummonerType[] = dataByPuuid.map(({ puuid, account, accountRegion }) => {
      const summoner = summonersDTO.find((s) => s.puuid === puuid)!;

      return this.summonerDataToDB(account, summoner, accountRegion);
    });

    const insertedSummoners = await db.insert(summonerTable).values(summoners).returning();

    return [...cached, ...insertedSummoners];
  }

  static async handleSummonerCreationFromAccountTx(
    tx: TransactionType,
    account: AccountDTOType,
    accountRegion: AccountRegionDTOType,
  ): Promise<SummonerWithRelationsType> {
    const summoner = await SummonerDTOService.getSummonerDTOByPuuid({
      puuid: account.puuid,
      region: accountRegion.region,
    });

    const data = this.summonerDataToDB(account, summoner, accountRegion);

    await tx
      .insert(summonerTable)
      .values(data)
      .onConflictDoUpdate({
        target: summonerTable.puuid,
        set: {
          displayRiotId: data.displayRiotId,
          riotId: data.riotId,
          normalizedRiotId: data.normalizedRiotId,
          summonerLevel: data.summonerLevel,
          profileIconId: data.profileIconId,
          region: data.region,
        },
      });

    const newSummoner = await this.getSummonerByPuuidTx(tx, data.puuid);

    if (!newSummoner) {
      throw new Error("Failed to create summoner");
    }

    return newSummoner;
  }

  private static summonerDataToDB(
    account: AccountDTOType,
    summoner: SummonerDTOType,
    accountRegion: AccountRegionDTOType,
  ): InsertSummonerType {
    return {
      puuid: account.puuid,

      displayRiotId: `${account.gameName}#${account.tagLine}`,
      riotId: trimRiotID(`${account.gameName}#${account.tagLine}`),
      normalizedRiotId: normalizeRiotID(`${account.gameName}#${account.tagLine}`),

      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      region: accountRegion.region,
      createdAt: new Date(),
    };
  }
}
