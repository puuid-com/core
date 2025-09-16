import { LolRegions } from "@/server/types/riot/common";
import * as v from "valibot";

export const AccountDTOSchema = v.object({
  puuid: v.string(),
  gameName: v.string(),
  tagLine: v.string(),
});
export type AccountDTOType = v.InferOutput<typeof AccountDTOSchema>;

export const AccountRegionDTOSchema = v.object({
  puuid: v.string(),
  game: v.picklist(["lol", "tft"]),
  region: v.picklist(LolRegions),
});
export type AccountRegionDTOType = v.InferOutput<typeof AccountRegionDTOSchema>;
