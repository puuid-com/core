import type { LolPositionType } from "@/shared/types/dto/MatchDTO";
import { type LeagueRowType } from "@/server/db/schema/league";
import { summonerTable } from "@/server/db/schema/summoner";
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { LeaderboardEntryRowType } from "@/server/db/schema/leaderboard";
import { uuidv7 } from "uuidv7";

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

export const summonerStatisticTable = pgTable("summoner_statistic", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  puuid: text("puuid")
    .references(() => summonerTable.puuid, { onDelete: "cascade" })
    .notNull(),

  mainPosition: text("main_position").$type<LolPositionType | null>(),
  mainChampionId: integer("main_champion_id"),

  kills: integer("kills").notNull(),
  assists: integer("assists").notNull(),
  deaths: integer("deaths").notNull(),

  averageKda: doublePrecision("average_kda").notNull(),
  averageKillPerGame: doublePrecision("average_kill_per_game").notNull(),
  averageDeathPerGame: doublePrecision("average_death_per_game").notNull(),
  averageAssistPerGame: doublePrecision("average_assist_per_game").notNull(),

  statsByTeammates: jsonb("stats_by_teammates")
    .$type<StatsByTeammate>()
    .notNull(),

  // stats
  statsByChampionId: jsonb("stats_by_champion_id")
    .$type<StatsByChampionId>()
    .notNull(),
  statsByPosition: jsonb("stats_by_position")
    .$type<StatsByIndividualPosition>()
    .notNull(),
  statsByOppositePositionChampionId: jsonb(
    "stats_by_opposite_position_champion_id"
  )
    .$type<StatsByChampionId>()
    .notNull(),

  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),

  createdAt: timestamp("refreshed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const summonerStatisticTableRelations = relations(
  summonerStatisticTable,
  ({ one }) => ({
    summoner: one(summonerTable, {
      fields: [summonerStatisticTable.puuid],
      references: [summonerTable.puuid],
    }),
  })
);

export type SummonerStatisticRowType =
  typeof summonerStatisticTable.$inferSelect;
export type InsertSummonerStatisticRowType =
  typeof summonerStatisticTable.$inferInsert;

export type StatisticWithLeagueType = SummonerStatisticRowType & {
  league:
    | (LeagueRowType & {
        leaderboardEntry: LeaderboardEntryRowType | null;
      })
    | null;
};
