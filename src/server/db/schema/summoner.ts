import { leagueTable, type LeagueRowType } from "@/server/db/schema/league";
import { matchSummonerTable } from "@/server/db/schema/match";
import { matchCommentTable } from "@/server/db/schema/match-comments";
import { noteTable } from "@/server/db/schema/note";
import { summonerRefresh } from "@/server/db/schema/summoner-refresh";
import {
  statisticTable,
  type StatisticWithLeagueType,
} from "@/server/db/schema/summoner-statistic";
import type { LolRegionType } from "@/server/types/riot/common";
import { relations } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const summonerTable = pgTable(
  "summoner",
  {
    puuid: text("puuid").primaryKey(),

    displayRiotId: text("display_riot_id").notNull(),
    riotId: text("riot_id").notNull(),
    normalizedRiotId: text("normalized_riot_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    profileIconId: integer("profile_icon_id").notNull(),
    summonerLevel: integer("summoner_level").notNull(),
    region: text("region").$type<LolRegionType>().notNull(),
  },
  (t) => [
    uniqueIndex("uq_ids_riot_id").on(t.riotId),
    index("idx_normalized_riot_id").on(t.normalizedRiotId),
  ],
);

export const summonerTableRelations = relations(summonerTable, ({ many, one }) => ({
  statistics: many(statisticTable),
  leagues: many(leagueTable),
  refresh: one(summonerRefresh),
  comments: many(matchCommentTable),
  notes: many(noteTable),
  matchSummoner: many(matchSummonerTable),
}));

export type SummonerType = typeof summonerTable.$inferSelect;
export type InsertSummonerType = typeof summonerTable.$inferInsert;

export type SummonerWithRelationsType = SummonerType & {
  statistics: StatisticWithLeagueType[];
  leagues: LeagueRowType[];
  refresh: typeof summonerRefresh.$inferSelect | null;
};
