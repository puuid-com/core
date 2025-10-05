import { normalizeString } from "@/lib/riotID";
import { db, type TransactionType } from "@/server/db";
import {
  userPageSummonerTable,
  userPageTable,
  type UserPageInsertType,
  type UserPageRowType,
  type UserPageSummonerRowType,
  type UserPageUpdateType,
  type UserPageWithRelations,
} from "@/server/db/schema/user-page";
import { SummonerService } from "@/server/services/SummonerService";
import { CDragonService } from "@/shared/services/CDragonService";
import type { User } from "better-auth";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export class UserPageService {
  static async getUserPageSummoners(userId: User["id"]) {
    return db.query.userPageTable.findFirst({
      where: eq(userPageTable.userId, userId),
      with: {
        summoners: true,
      },
    });
  }

  static async addUserPageSummonerTx(
    tx: TransactionType,
    values: Pick<
      UserPageSummonerRowType,
      "puuid" | "type" | "userPageId" | "isPublic"
    >
  ) {
    const summoner = await SummonerService.getOrCreateSummonerByPuuidTx(
      tx,
      values.puuid,
      false
    );
    const userPageSummoner = await tx.insert(userPageSummonerTable).values({
      ...values,
    });

    return {
      summoner,
      userPageSummoner,
    };
  }

  static async gerOrCreateUserPageTx(
    tx: TransactionType,
    userId: User["id"]
  ): Promise<{ page: UserPageWithRelations; wasCreated: boolean }> {
    const page = await this.getUserPageByUser(userId);

    if (page) {
      return {
        page,
        wasCreated: false,
      };
    }

    const newPage = await this.createUserPageTx(tx, {
      userId,
      displayName: "New User Page",
      isPublic: false,
      profileImage: CDragonService.getProfileIcon(29),
      type: "DEFAULT",
    });

    return {
      page: {
        ...newPage,
        summoners: [],
      },
      wasCreated: true,
    };
  }

  static async getUserPageById(id: UserPageRowType["id"]) {
    const page = await db.query.userPageTable.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: {
        summoners: true,
      },
    });

    if (!page) {
      throw new Error("No page found");
    }

    return page;
  }

  static async getUserPageByUser(userId: User["id"]) {
    return db.query.userPageTable.findFirst({
      where: eq(userPageTable.userId, userId),
      with: {
        summoners: {
          with: {
            summoner: {
              with: {
                leagues: true,
                refreshes: {
                  with: {
                    summonerStatistic: true,
                    league: {
                      with: {
                        leaderboardEntry: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  static async createUserPageTx(
    tx: TransactionType,
    data: Omit<UserPageInsertType, "normalizedName">
  ) {
    const [userPage] = await tx
      .insert(userPageTable)
      .values({
        ...data,
        normalizedName: normalizeString(data.displayName),
      })
      .returning();

    if (!userPage) {
      throw new Error("Error creating user page.");
    }

    return userPage;
  }

  static async searchUserPage(
    options: { search?: string; limit?: number } = {}
  ) {
    const { search, limit = 25 } = options;

    const trimmed = search?.trim();

    if (!trimmed) {
      return [];
    }

    const norm = normalizeString(trimmed);

    if (!norm) {
      return [];
    }

    const pattern = `%${norm}%`;
    const prefixPattern = `${norm}%`;

    const jwThreshold = norm.length <= 3 ? 0.6 : norm.length <= 4 ? 0.68 : 0.75;

    const fuzzyMatch = sql<boolean>`jarowinkler(${userPageTable.normalizedName}, ${norm}) >= ${jwThreshold}`;

    const whereClause = and(
      eq(userPageTable.isPublic, true),
      or(ilike(userPageTable.normalizedName, pattern), fuzzyMatch)
    );

    const simName = sql<number>`jarowinkler(${userPageTable.normalizedName}, ${norm})`;

    const score = sql<number>`
      (CASE WHEN ${fuzzyMatch} THEN 100 ELSE 0 END)
      + ${simName}
      + (CASE WHEN ${userPageTable.normalizedName} ILIKE ${prefixPattern} THEN 1 ELSE 0 END)
    `;

    return db
      .select()
      .from(userPageTable)
      .where(whereClause)
      .orderBy(desc(score), userPageTable.displayName)
      .limit(limit);
  }

  static async getUserPage(displayName: string) {
    const normalizedName = normalizeString(displayName);

    return db.query.userPageTable.findFirst({
      where: eq(userPageTable.normalizedName, normalizedName),
      with: {
        summoners: {
          with: {
            summoner: {
              with: {
                refreshes: {
                  with: {
                    recentSummonerStatistic: true,
                    summonerStatistic: true,
                  },
                },
                leagues: true,
              },
            },
          },
        },
      },
    });
  }

  static async updateUserPage(userId: User["id"], data: UserPageUpdateType) {
    return db
      .update(userPageTable)
      .set({
        ...data,
        ...(data.displayName
          ? { normalizedName: normalizeString(data.displayName) }
          : {}),
      })
      .where(eq(userPageTable.userId, userId));
  }
}
