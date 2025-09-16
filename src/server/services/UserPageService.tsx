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
import { SummonerService } from "@/server/services/summoner/SummonerService";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import type { User } from "better-auth";
import { desc, eq, ilike, sql } from "drizzle-orm";

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
                statistics: {
                  with: {
                    league: true,
                  },
                },
                leagues: true,
                refresh: true,
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

  static async searchUserPage(search: string) {
    const norm = normalizeString(search);
    const pattern = `%${norm}%`;
    const prefixPattern = `${norm}%`;

    // Similarity score using Jaro-Winkler, with a tiny prefix boost
    const sim = sql<number>`jarowinkler(${userPageTable.normalizedName}, ${norm})`;
    const score = sql<number>`
      ${sim}
      + (CASE WHEN ${userPageTable.normalizedName} ILIKE ${prefixPattern} THEN 0.001 ELSE 0 END)
    `;

    return db
      .select()
      .from(userPageTable)
      .where(ilike(userPageTable.normalizedName, pattern))
      .orderBy(desc(score), userPageTable.displayName);
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
                statistics: true,
                refresh: true,
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
