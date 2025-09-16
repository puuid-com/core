import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { LolPositionType } from "@/server/api-route/riot/match/MatchDTO";
import type {
  StatsByTeammate,
  StatsByChampionId,
  StatsByIndividualPosition,
} from "@/server/db/schema/summoner-statistic";
import { userPageTable } from "@/server/db/schema/user-page";
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const userPageStatisticTable = pgTable(
  "user_page_statistic",
  {
    userPageId: text("user_page_id")
      .references(() => userPageTable.id, { onDelete: "cascade" })
      .notNull(),
    queueType: text("queue_type").$type<LolQueueType>().notNull(),

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

    statsByChampionId: jsonb("stats_by_champion_id").$type<StatsByChampionId>().notNull(),
    statsByPosition: jsonb("stats_by_position").$type<StatsByIndividualPosition>().notNull(),
    statsByOppositePositionChampionId: jsonb("stats_by_opposite_position_champion_id")
      .$type<StatsByChampionId>()
      .notNull(),

    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    refreshedAt: timestamp("refreshed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userPageId, t.queueType] })],
);
export const userPageStatisticTableRelations = relations(userPageStatisticTable, ({ one }) => ({
  userPage: one(userPageTable, {
    fields: [userPageStatisticTable.userPageId],
    references: [userPageTable.id],
  }),
}));

export type UserPageStatisticRowType = typeof userPageStatisticTable.$inferSelect;
export type InsertUserPageStatisticRowType = typeof userPageStatisticTable.$inferInsert;
