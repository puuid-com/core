import { user } from "@/server/db/schema/auth";
import { summonerTable } from "@/server/db/schema/summoner";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const followingTable = pgTable(
  "folowing",
  {
    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("idx_following_puuid_user_id").on(t.puuid, t.userId)],
);

export const followingTableRelations = relations(followingTable, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [followingTable.puuid],
    references: [summonerTable.puuid],
  }),
  user: one(user, {
    fields: [followingTable.userId],
    references: [user.id],
  }),
}));

export type FollowingRowType = typeof followingTable.$inferSelect;
export type FollowingInsertType = typeof followingTable.$inferInsert;
