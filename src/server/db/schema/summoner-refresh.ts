import type { LolQueueType } from "@/shared/types/dto/LeagueDTO";
import { summonerTable } from "@/server/db/schema/summoner";
import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { summonerStatisticTable } from "@/server/db/schema/summoner-statistic";
import { leagueTable } from "@/server/db/schema/league";

export const summonerRefresh = pgTable(
  "summoner_refresh",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),

    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),
    queueType: text("queue_type").$type<LolQueueType>().notNull(),

    latestLeagueEntryId: uuid("latest_league_entry_id").references(
      () => leagueTable.id,
      {
        onDelete: "set null",
      }
    ),

    summonerStatisticId: uuid("summoner_statistic_id")
      .references(() => summonerStatisticTable.id, { onDelete: "cascade" })
      .notNull(),
    recentSummonerStatisticId: uuid("recent_summoner_statistic_id")
      .references(() => summonerStatisticTable.id, { onDelete: "cascade" })
      .notNull(),

    lastGameCreationEpochSec: integer("last_game_creation_epoch_sec"),

    isFullRefresh: boolean("is_full_refresh").notNull(),

    refreshedAt: timestamp("refreshed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_summoner_refresh_puuid_queue_type").on(
      t.puuid,
      t.queueType
    ),
  ]
);

export const summonerRefreshRelations = relations(
  summonerRefresh,
  ({ one }) => ({
    summoner: one(summonerTable, {
      fields: [summonerRefresh.puuid],
      references: [summonerTable.puuid],
    }),
    league: one(leagueTable, {
      fields: [summonerRefresh.latestLeagueEntryId],
      references: [leagueTable.id],
    }),
    summonerStatistic: one(summonerStatisticTable, {
      fields: [summonerRefresh.summonerStatisticId],
      references: [summonerStatisticTable.id],
    }),
    recentSummonerStatistic: one(summonerStatisticTable, {
      fields: [summonerRefresh.recentSummonerStatisticId],
      references: [summonerStatisticTable.id],
    }),
  })
);

export type SummonerRefreshType = typeof summonerRefresh.$inferSelect;
export type InsertSummonerRefreshType = typeof summonerRefresh.$inferInsert;
