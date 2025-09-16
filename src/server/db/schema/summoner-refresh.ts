import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { summonerTable } from "@/server/db/schema/summoner";
import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const summonerRefresh = pgTable("summoner_refresh", {
  puuid: text("puuid")
    .primaryKey()
    .references(() => summonerTable.puuid, { onDelete: "cascade" })
    .notNull(),
  queueType: text("queue_type").$type<LolQueueType>().notNull(),
  lastGameCreationEpochSec: integer("last_game_creation_epoch_sec"),
  refreshedAt: timestamp("refreshed_at", { withTimezone: true }).notNull().defaultNow(),
  isFullRefresh: boolean("is_full_refresh").notNull(),
});

export const summonerRefreshRelations = relations(summonerRefresh, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [summonerRefresh.puuid],
    references: [summonerTable.puuid],
  }),
}));

export type SummonerRefreshType = typeof summonerRefresh.$inferSelect;
export type InsertSummonerRefreshType = typeof summonerRefresh.$inferInsert;
