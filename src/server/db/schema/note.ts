import { user } from "@/server/db/schema/auth";
import { summonerTable } from "@/server/db/schema/summoner";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const noteTable = pgTable(
  "note",
  {
    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    note: text("note").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("idx_note_puuid_user_id").on(t.puuid, t.userId)],
);
export type NoteRowType = typeof noteTable.$inferSelect;
export type NoteInsertType = typeof noteTable.$inferInsert;

export const noteTableRelations = relations(noteTable, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [noteTable.puuid],
    references: [summonerTable.puuid],
  }),
  user: one(user, {
    fields: [noteTable.userId],
    references: [user.id],
  }),
}));
