import { user } from "@/server/db/schema/auth";
import {
  summonerTable,
  type SummonerWithRelationsType,
} from "@/server/db/schema/summoner";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export type UserPageType = "DEFAULT";

export const userPageTable = pgTable(
  "user_page",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),

    displayName: text("display_name").notNull(),
    normalizedName: text("normalized_name").notNull(),

    description: text("description"),
    profileImage: text("profile_image").notNull(),
    xUsername: text("x_username"),
    twitchUsername: text("twitch_username"),

    type: text("text").$type<UserPageType>().notNull(),

    isPublic: boolean("is_public").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx").on(t.normalizedName, t.isPublic),
    uniqueIndex("uq_name")
      .on(t.normalizedName, t.displayName)
      .where(sql`${t.isPublic} = true`),
  ]
);

export type UserPageSummonerType = "MAIN" | "SMURF";

export const userPageSummonerTable = pgTable("user_page_summoner", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  userPageId: uuid("user_page_id")
    .references(() => userPageTable.id, { onDelete: "cascade" })
    .notNull(),
  puuid: text("puuid").unique().notNull(),
  isPublic: boolean("is_public").notNull(),
  type: text("type").$type<UserPageSummonerType>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userPageSummonerTableRelations = relations(
  userPageSummonerTable,
  ({ one }) => ({
    userPage: one(userPageTable, {
      fields: [userPageSummonerTable.userPageId],
      references: [userPageTable.id],
    }),
    summoner: one(summonerTable, {
      fields: [userPageSummonerTable.puuid],
      references: [summonerTable.puuid],
    }),
  })
);

export type UserPageSummonerRowType = typeof userPageSummonerTable.$inferSelect;
export type UserPageSummonerInsertType =
  typeof userPageSummonerTable.$inferInsert;

export type UserPageSummonerTypeWithRelations = UserPageSummonerRowType & {
  summoner: SummonerWithRelationsType;
};

export type UserPageRowType = typeof userPageTable.$inferSelect;
export type UserPageInsertType = typeof userPageTable.$inferInsert;
export type UserPageUpdateType = Partial<
  Omit<
    UserPageInsertType,
    "id" | "userId" | "createdAt" | "normalizedName" | "type"
  >
>;

export type UserPageWithRelations = UserPageRowType & {
  summoners: UserPageSummonerTypeWithRelations[];
};

export const userPageTableRelations = relations(
  userPageTable,
  ({ one, many }) => ({
    user: one(user),
    summoners: many(userPageSummonerTable),
  })
);
