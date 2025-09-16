import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { LolPositionType } from "@/server/api-route/riot/match/MatchDTO";
import { leagueTable, type LeagueRowType } from "@/server/db/schema/league";
import { summonerTable } from "@/server/db/schema/summoner";
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export type StatItemType = {
  wins: number;
  losses: number;
  kills: number;
  assists: number;
  deaths: number;
};

export type StatsByChampionId = (StatItemType & { championId: number })[];
export type StatsByIndividualPosition = (StatItemType & {
  position: LolPositionType;
})[];
export type StatsByTeamId = (StatItemType & { teamId: number })[];

export type StatsByTeammate = { wins: number; losses: number; puuid: string }[];

export const statisticTable = pgTable(
  "summoner_statistic",
  {
    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),
    queueType: text("queue_type").$type<LolQueueType>().notNull(),

    latestLeagueEntryId: uuid("latest_league_entry_id").references(() => leagueTable.id, {
      onDelete: "set null",
    }),
    mainPosition: text("main_position").$type<LolPositionType | null>(),

    mainChampionId: integer("main_champion_id").notNull(),
    mainChampionSkinId: integer("main_champion_skin_id").notNull().default(0),
    mainChampionBackgroundColor: text("main_champion_background_color"),
    mainChampionForegroundColor: text("main_champion_foreground_color"),

    kills: integer("kills").notNull(),
    assists: integer("assists").notNull(),
    deaths: integer("deaths").notNull(),

    averageKda: doublePrecision("average_kda").notNull(),
    averageKillPerGame: doublePrecision("average_kill_per_game").notNull(),
    averageDeathPerGame: doublePrecision("average_death_per_game").notNull(),
    averageAssistPerGame: doublePrecision("average_assist_per_game").notNull(),

    statsByTeammates: jsonb("stats_by_teammates").$type<StatsByTeammate>().notNull(),

    // stats
    statsByChampionId: jsonb("stats_by_champion_id").$type<StatsByChampionId>().notNull(),
    statsByPosition: jsonb("stats_by_position").$type<StatsByIndividualPosition>().notNull(),
    statsByOppositePositionChampionId: jsonb("stats_by_opposite_position_champion_id")
      .$type<StatsByChampionId>()
      .notNull(),

    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    refreshedAt: timestamp("refreshed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.puuid, t.queueType] })],
);
export const statisticTableRelations = relations(statisticTable, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [statisticTable.puuid],
    references: [summonerTable.puuid],
  }),
  league: one(leagueTable, {
    fields: [statisticTable.latestLeagueEntryId],
    references: [leagueTable.id],
  }),
}));

export type StatisticRowType = typeof statisticTable.$inferSelect;
export type InsertStatisticRowType = typeof statisticTable.$inferInsert;

export type StatisticWithLeagueType = StatisticRowType & {
  league: LeagueRowType | null;
};
