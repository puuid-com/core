import { RiotApiRoute } from "@/server/api-route/ApiRoute";
import type { AccountDTOType } from "@/shared/types/dto/AccountDTO";
import {
  LeagueDTOSchema,
  LeagueListDTOSchema,
  type LolQueueType,
} from "@/shared/types/dto/LeagueDTO";
import type { LolRegionType } from "@/shared/types/riot/common";
import * as v from "valibot";

export const LeagueV4ByPuuid = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType; puuid: AccountDTOType["puuid"] }) =>
    `https://${params.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${params.puuid}`,
  key: `league-v4__by-puuid`,
  schema: v.array(LeagueDTOSchema),
});

export const LeagueV4Challengers = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType; queue: LolQueueType }) =>
    `https://${params.region}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/${params.queue}`,
  key: `league-v4__challenger-leagues`,
  schema: LeagueListDTOSchema,
});

export const LeagueV4Grandmasters = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType; queue: LolQueueType }) =>
    `https://${params.region}.api.riotgames.com/lol/league/v4/grandmasterleagues/by-queue/${params.queue}`,
  key: `league-v4__grandmaster-leagues`,
  schema: LeagueListDTOSchema,
});

export const LeagueV4Masters = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType; queue: LolQueueType }) =>
    `https://${params.region}.api.riotgames.com/lol/league/v4/masterleagues/by-queue/${params.queue}`,
  key: `league-v4__master-leagues`,
  schema: LeagueListDTOSchema,
});
