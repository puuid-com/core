import { leagueTable } from "@/server/db/schema/league";
import { summonerTable } from "@/server/db/schema/summoner";
import type { LolApexTierType, LolQueueType, LolRegionType } from "@/shared";
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  integer,
  date,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const leaderboardTable = pgTable(
  "leaderboard",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    tier: text("tier").$type<LolApexTierType>().notNull(),
    queue: text("queue").$type<LolQueueType>().notNull(),
    region: text("region").$type<LolRegionType>().notNull(),

    date: date("date", { mode: "date" }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_leaderboard_idx_unique").on(
      t.tier,
      t.queue,
      t.region,
      t.date
    ),
  ]
);

export type LeaderboardRowType = typeof leaderboardTable.$inferSelect;
export type InsertLeaderboardRowType = typeof leaderboardTable.$inferInsert;

export const leaderboardEntryTable = pgTable("leaderboard_entry", {
  leaderboardId: uuid("leaderboard_id")
    .references(() => leaderboardTable.id, { onDelete: "cascade" })
    .notNull(),
  leagueId: uuid("league_id")
    .references(() => leagueTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),

  dayIndex: integer("day_index").notNull(),
  lastDayIndex: integer("last_day_index"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const leaderboardTableRealtions = relations(
  leaderboardTable,
  ({ many }) => ({
    entries: many(leaderboardEntryTable),
  })
);

export const leaderboardEntryTableRealtions = relations(
  leaderboardEntryTable,
  ({ one }) => ({
    leaderboard: one(leaderboardTable, {
      fields: [leaderboardEntryTable.leaderboardId],
      references: [leaderboardTable.id],
    }),
    league: one(leagueTable, {
      fields: [leaderboardEntryTable.leagueId],
      references: [leagueTable.id],
    }),
  })
);

export type LeaderboardEntryRowType = typeof leaderboardEntryTable.$inferSelect;
export type InsertLeaderboardentryRowType =
  typeof leaderboardEntryTable.$inferInsert;
