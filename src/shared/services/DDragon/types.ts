import * as v from "valibot";

export const VersionsResponseSchema = v.array(v.string());
export type VersionsResponseType = v.InferOutput<typeof VersionsResponseSchema>;

export const ChampionResponseSchema = v.object({
  id: v.string(),
  key: v.string(),
  name: v.string(),
  title: v.string(),
  blurb: v.string(),
  image: v.object({
    full: v.string(),
    sprite: v.string(),
  }),
});
export type ChampionResponseType = v.InferOutput<typeof ChampionResponseSchema>;

export const ChampionsResponseSchema = v.pipe(
  v.object({
    data: v.record(v.string(), ChampionResponseSchema),
    version: v.string(),
  }),
  v.transform((data) => {
    const flippedData = Object.entries(data.data).reduce<Record<string, ChampionResponseType>>(
      (acc, [, value]) => {
        acc[value.key] = value;

        return acc;
      },
      {},
    );

    return {
      ...data,
      data: flippedData,
    };
  }),
);

export type ChampionsResponseType = v.InferOutput<typeof ChampionsResponseSchema>;

const SummonerSpellSchema = v.object({
  key: v.string(),
  id: v.string(),
  name: v.string(),
  description: v.string(),
  image: v.object({
    full: v.string(),
  }),
});

// Define the schema for the full API response
export const SummonerSpellsResponseSchema = v.object({
  type: v.string(),
  version: v.string(),
  data: v.record(SummonerSpellSchema.entries.id, SummonerSpellSchema),
});

export type FormattedSummonerSpellsType = Record<string, v.InferOutput<typeof SummonerSpellSchema>>;
