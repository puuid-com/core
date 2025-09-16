import * as v from "valibot";

export const SummonerDTOSchema = v.object({
  puuid: v.string(),
  profileIconId: v.number(),
  revisionDate: v.pipe(
    v.number(),
    v.transform((input) => new Date(input).toISOString()),
  ),
  summonerLevel: v.number(),
});
export type SummonerDTOType = v.InferOutput<typeof SummonerDTOSchema>;
