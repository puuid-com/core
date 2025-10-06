import type { LeaderboardEntryRowType } from "@/server/db/schema/leaderboard";
import { leagueTable, type LeagueRowType } from "@/server/db/schema/league";
import { matchSummonerTable } from "@/server/db/schema/match";
import { matchCommentTable } from "@/server/db/schema/match-comments";
import { noteTable, type NoteRowType } from "@/server/db/schema/note";
import {
  summonerRefresh,
  type SummonerRefreshType,
  type SummonerRefreshWithStatisticType,
} from "@/server/db/schema/summoner-refresh";
import { type SummonerStatisticRowType } from "@/server/db/schema/summoner-statistic";
import type { LolRegionType } from "@/shared/types/riot/common";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const summonerTable = pgTable(
  "summoner",
  {
    puuid: text("puuid").primaryKey(),

    displayRiotId: text("display_riot_id").notNull(),
    riotId: text("riot_id").notNull(),
    normalizedRiotId: text("normalized_riot_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    profileIconId: integer("profile_icon_id").notNull(),
    summonerLevel: integer("summoner_level").notNull(),
    region: text("region").$type<LolRegionType>().notNull(),

    mainChampionId: integer("main_champion_id"),
    mainChampionSkinId: integer("main_champion_skin_id"),
    mainChampionBackgroundColor: text("main_champion_background_color"),
    mainChampionForegroundColor: text("main_champion_foreground_color"),
  },
  (t) => [
    uniqueIndex("uq_ids_riot_id").on(t.riotId),
    index("idx_normalized_riot_id").on(t.normalizedRiotId),
  ]
);

export const summonerTableRelations = relations(summonerTable, ({ many }) => ({
  leagues: many(leagueTable),
  refreshes: many(summonerRefresh),
  notes: many(noteTable),
  matchSummoner: many(matchSummonerTable),
}));

export type SummonerType = typeof summonerTable.$inferSelect;
export type InsertSummonerType = typeof summonerTable.$inferInsert;

export type SummonerWithNote = SummonerType & {
  note: NoteRowType | undefined;
};
export type SummonerWithRelationsType = SummonerType & {
  leagues: LeagueRowType[];
  refreshes: SummonerRefreshWithStatisticType[];
};
