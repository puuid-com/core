import { matchTable } from "@/server/db/schema/match";
import { userPageSummonerTable } from "@/server/db/schema/user-page";
import { relations } from "drizzle-orm";
import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const matchCommentTable = pgTable(
  "match_comment",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    userPageSummonerId: uuid("user_page_summoner_id")
      .references(() => userPageSummonerTable.id, { onDelete: "cascade" })
      .notNull(),
    matchId: text("match_id")
      .references(() => matchTable.matchId, { onDelete: "cascade" })
      .notNull(),
    text: text("text").notNull(),
    tags: text("tags").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_mc_matchid").on(t.matchId),
    index("idx_mc_user_page_summoner_id").on(t.userPageSummonerId),
  ],
);

export type MatchCommentRowType = typeof matchCommentTable.$inferSelect;
export type InsertMatchCommentRowType = typeof matchCommentTable.$inferInsert;

export const matchCommentTableRelations = relations(matchCommentTable, ({ one }) => ({
  userPageSummoner: one(userPageSummonerTable, {
    fields: [matchCommentTable.userPageSummonerId],
    references: [userPageSummonerTable.id],
  }),
  match: one(matchTable, {
    fields: [matchCommentTable.matchId],
    references: [matchTable.matchId],
  }),
}));
