import {
  VersionsResponseSchema,
  ChampionsResponseSchema,
  SummonerSpellsResponseSchema,
  type FormattedSummonerSpellsType,
  type ChampionsResponseType,
} from "@/shared/services/DDragon/types";
import ky from "ky";
import * as v from "valibot";
import type { MatchSummonerRowType } from "@/server/db/schema/match";
import { DDragonItemFileSchema, type DDragonItemsData } from "@/shared/services/DDragon/items-dto";
import type { ProfileIconType } from "@/shared/services/DDragon/profile-icons-dto";
import type { SummonerType } from "@/server/db/schema/summoner";
import { DDragonChampionFileSchema } from "@/shared/services/DDragon/champion-dto";

export type DDragonMetadata = {
  champions: ChampionsResponseType["data"];
  latest_version: string;
  summoner_spells: FormattedSummonerSpellsType;
  items: DDragonItemsData;
};

export class DDragonService {
  private static async getVersions() {
    const response = await ky.get(`https://ddragon.leagueoflegends.com/api/versions.json`).json();

    return v.parse(VersionsResponseSchema, response);
  }

  static async getLatestVersion() {
    const versions = await this.getVersions();
    return versions[0]!;
  }

  static async getChampionsData(version: string) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`;
    const response = await ky.get(url).json();
    return v.parse(ChampionsResponseSchema, response).data;
  }

  static async getSpellsData(version: string) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`;
    const response = await ky.get(url).json();
    const parsed = v.parse(SummonerSpellsResponseSchema, response);

    const reshaped: FormattedSummonerSpellsType = {};
    for (const value of Object.values(parsed.data)) {
      reshaped[value.key] = value;
    }
    return reshaped;
  }

  static async getItemsData(version: string) {
    const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/item.json`;
    const response = await ky.get(url).json();
    return v.parse(DDragonItemFileSchema, response);
  }

  static getProfileIconUrl(version: string, id: SummonerType["profileIconId"]) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/profileicon/${id}.png`;
  }

  static getChampionName(champions: ChampionsResponseType["data"], id: number) {
    return champions[id]!.name;
  }

  static getItemIconUrl(version: string, id: number) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`;
  }

  static getChampionIconUrl(
    version: string,
    imageFull: ChampionsResponseType["data"][number]["image"]["full"],
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${imageFull}`;
  }

  static getChampionIconUrlFromParticipant(
    champions: ChampionsResponseType["data"],
    version: string,
    p: Pick<MatchSummonerRowType, "championId">,
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${champions[p.championId]!.image.full}`;
  }

  static getChampionSplash(
    champions: ChampionsResponseType["data"],
    championId: MatchSummonerRowType["championId"],
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champions[championId]!.id}_0.jpg`;
  }

  static getChampionLoadingScreenImage(
    champions: ChampionsResponseType["data"],
    championId: MatchSummonerRowType["championId"],
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champions[championId]!.id}_0.jpg`;
  }

  static getSummonerSpellIconUrl(
    summoner_spells: FormattedSummonerSpellsType,
    version: string,
    id: MatchSummonerRowType["spellIds"][number],
  ) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${summoner_spells[id]!.image.full}`;
  }

  static async getProfileIcons(version: string) {
    const data = await ky
      .get(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/profileicon.json`, {})
      .json<ProfileIconType>();

    return Object.entries(data.data).map(([, value]) => {
      return {
        id: value.id,
        image: value.image.full,
      };
    });
  }

  static async getChampionData(version: string, stringId: string) {
    const data = await ky
      .get(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion/${stringId}.json`,
      )
      .json();

    return v.parse(DDragonChampionFileSchema, data);
  }

  static getChampionStringId(champions: ChampionsResponseType["data"], championId: number) {
    return champions[championId]!.id;
  }

  static async getMetadata(): Promise<DDragonMetadata> {
    const version = await DDragonService.getLatestVersion();

    try {
      const [spells, champions, items] = await Promise.all([
        DDragonService.getSpellsData(version),
        DDragonService.getChampionsData(version),
        DDragonService.getItemsData(version),
      ]);

      return {
        champions,
        latest_version: version,
        summoner_spells: spells,
        items,
      };
    } catch (error) {
      if (v.isValiError(error)) {
        console.error(v.summarize(error.issues), error);
      } else {
        console.error("Error loading DDragon metadata:", error);
      }

      throw error;
    }
  }

  static async loadMetadata() {
    return DDragonService.getMetadata();
  }
}
