import { RiotApiRoute } from "@/server/api-route/ApiRoute";
import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import { ChampionMasteryListDTOSchema } from "@/server/api-route/riot/champion-mastery/ChampionMasteryDTO";
import type { LolRegionType } from "@/server/types/riot/common";

export const ChampionMasteryV4ByPuuid = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType; puuid: AccountDTOType["puuid"] }) =>
    `https://${params.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${params.puuid}`,
  key: `champion-mastery-v4__by-puuid`,
  schema: ChampionMasteryListDTOSchema,
});
