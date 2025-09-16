import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { summonerTable } from "@/server/db/schema/summoner";
import type { LolTierType } from "@/server/types/riot/common";
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const leagueTable = pgTable(
  "league",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    leagueId: text("league_id").notNull(),
    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),

    queueType: text("queue_type").$type<LolQueueType>().notNull(),
    tier: text("tier").$type<LolTierType>().notNull(),
    rank: text("rank"),

    leaguePoints: integer("league_points").notNull(),
    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    isLatest: boolean("is_latest").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_le_puuid").on(t.puuid),
    uniqueIndex("uq_le_puuid_queue_latest")
      .on(t.puuid, t.queueType)
      .where(sql`${t.isLatest} is true`),
  ],
);

export type LeagueRowType = typeof leagueTable.$inferSelect;
export type InsertLeagueRowType = typeof leagueTable.$inferInsert;

export const leagueEntryTableRelations = relations(leagueTable, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [leagueTable.puuid],
    references: [summonerTable.puuid],
  }),
}));
