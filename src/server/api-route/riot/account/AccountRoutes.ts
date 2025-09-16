import { RiotApiRoute } from "@/server/api-route/ApiRoute";
import {
  AccountDTOSchema,
  AccountRegionDTOSchema,
  type AccountDTOType,
} from "@/server/api-route/riot/account/AccountDTO";
import type { LolRoutingValueType } from "@/server/types/riot/common";

export const AcountRegionV1ByPuuid = new RiotApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    puuid: AccountDTOType["puuid"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/region/by-game/lol/by-puuid/${params.puuid}`,
  key: `account-v1__region`,
  schema: AccountRegionDTOSchema,
});

export const AcountV1ByRiotID = new RiotApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    gameName: AccountDTOType["gameName"];
    tagLine: AccountDTOType["tagLine"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${params.gameName}/${params.tagLine}`,
  key: `account-v1__by-riot-id`,
  schema: AccountDTOSchema,
});

export const AcountV1ByPuuid = new RiotApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    puuid: AccountDTOType["puuid"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${params.puuid}`,
  key: `account-v1__by-puuid`,
  schema: AccountDTOSchema,
});

export const AcountV1ByMe = new RiotApiRoute({
  getUrl: (params: { routingValue: LolRoutingValueType }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/accounts/me`,
  key: `account-v1__me`,
  schema: AccountDTOSchema,
});
