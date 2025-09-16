import { pgTable, text, integer, boolean, bigint, index } from "drizzle-orm/pg-core";
import { desc, relations, type InferSelectModel } from "drizzle-orm";
import type { LolPositionType } from "@/server/api-route/riot/match/MatchDTO";
import { matchCommentTable } from "@/server/db/schema/match-comments";
import { summonerTable } from "@/server/db/schema/summoner";

export const MatchResults = ["NORMAL", "SURRENDER", "REMAKE"] as const;
export type MatchResultType = (typeof MatchResults)[number];

export const matchTable = pgTable(
  "match",
  {
    matchId: text("match_id").primaryKey(),
    gameCreationMs: bigint("game_creation_ms", { mode: "number" }).notNull(),
    gameDurationSec: integer("game_duration_sec").notNull(),
    queueId: integer("queue_id").notNull(),
    platformId: text("platform_id").notNull(),
    resultType: text("result_type").$type<MatchResultType>().notNull(),
  },
  (t) => [
    index("idx_match_game_time").on(t.gameCreationMs, t.matchId),
    index("idx_match_queue_time").on(t.queueId, t.gameCreationMs),
  ],
);

export type MatchRowType = typeof matchTable.$inferSelect;
export type MatchInsertType = typeof matchTable.$inferInsert;

export const matchRelations = relations(matchTable, ({ many }) => ({
  summoners: many(matchSummonerTable),
}));

export const matchSummonerTable = pgTable(
  "match_summoner",
  {
    matchId: text("match_id")
      .notNull()
      .references(() => matchTable.matchId, { onDelete: "cascade" }),
    // For query performance
    gameCreationMs: bigint("game_creation_ms", { mode: "number" }).notNull(),
    puuid: text("puuid").notNull(),
    gameName: text("game_name").notNull(),
    tagLine: text("tag_line").notNull(),
    profileIconId: integer("profile_icon_id").notNull(),

    position: text("position").$type<LolPositionType>().notNull(),
    teamId: integer("team_id").notNull(),
    win: boolean("win").notNull(),

    kills: integer("kills").notNull(),
    deaths: integer("deaths").notNull(),
    assists: integer("assists").notNull(),

    totalDamageDealtToChampions: integer("total_damage_dealt_to_champions").notNull(),
    totalDamageTaken: integer("total_damage_taken").notNull(),

    championId: integer("champion_id").notNull(),
    champLevel: integer("champ_level").notNull(),

    items: integer("items").array().notNull(),
    cs: integer("cs").notNull(),

    vsSummonerPuuid: text("vs_summoner_puuid"),

    damageDealtToObjectives: integer("damage_dealt_to_objectives").notNull(),
    dragonKills: integer("dragon_kills").notNull(),
    visionScore: integer("vision_score").notNull(),
    largestCriticalStrike: integer("largest_critical_strike").notNull(),
    soloKills: integer("solo_kills").notNull(),
    wardTakedowns: integer("ward_takedowns").notNull(),
    inhibitorKills: integer("inhibitor_kills").notNull(),
    turretKills: integer("turret_kills").notNull(),

    spellIds: integer("spell_ids").array().notNull(),
  },
  (t) => [
    index("idx_fms_match").on(t.matchId),
    index("idx_fms_puuid").on(t.puuid),
    index("idx_ms_puuid_matchid").on(t.puuid, t.matchId),
    index("idx_ms_puuid_matchid_gameCreationMs").on(t.puuid, t.matchId, desc(t.gameCreationMs)),
  ],
);

export type MatchSummonerRowType = typeof matchSummonerTable.$inferSelect;
export type MatchSummonerInsertType = typeof matchSummonerTable.$inferInsert;

export const matchSummonerRelations = relations(matchSummonerTable, ({ one, many }) => ({
  match: one(matchTable, {
    fields: [matchSummonerTable.matchId],
    references: [matchTable.matchId],
  }),
  comments: many(matchCommentTable),
  summoner: one(summonerTable, {
    fields: [matchSummonerTable.puuid],
    references: [summonerTable.puuid],
  }),
}));

export type MatchWithSummonersType = InferSelectModel<typeof matchTable> & {
  summoners: InferSelectModel<typeof matchSummonerTable>[];
};
