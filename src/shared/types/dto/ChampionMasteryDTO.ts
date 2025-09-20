import * as v from "valibot";

const NextSeasonMilestonesDTOSchema = v.object({
  requireGradeCounts: v.record(v.string(), v.number()),
  rewardMarks: v.number(),
  bonus: v.boolean(),
  totalGamesRequires: v.number(),
});

const ChampionMasteryDTOSchema = v.object({
  puuid: v.string(),
  championId: v.number(),
  championLevel: v.number(),
  championPoints: v.number(),
  lastPlayTime: v.number(),
  championPointsSinceLastLevel: v.number(),
  championPointsUntilNextLevel: v.number(),
  markRequiredForNextLevel: v.number(),
  tokensEarned: v.number(),
  championSeasonMilestone: v.number(),
  nextSeasonMilestone: NextSeasonMilestonesDTOSchema,
});

const ChampionMasteryListDTOSchema = v.array(ChampionMasteryDTOSchema);

/** Types */
type NextSeasonMilestonesDTOType = v.InferOutput<typeof NextSeasonMilestonesDTOSchema>;
type ChampionMasteryDTOType = v.InferOutput<typeof ChampionMasteryDTOSchema>;
type ChampionMasteryListDTOType = v.InferOutput<typeof ChampionMasteryListDTOSchema>;

export { NextSeasonMilestonesDTOSchema, ChampionMasteryDTOSchema, ChampionMasteryListDTOSchema };

export type { NextSeasonMilestonesDTOType, ChampionMasteryDTOType, ChampionMasteryListDTOType };
