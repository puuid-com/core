import { RiotApiRoute } from "@/server/api-route/ApiRoute";
import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import { LeagueDTOSchema } from "@/server/api-route/riot/league/LeagueDTO";
import type { LolRegionType } from "@/server/types/riot/common";
import * as v from "valibot";

export const LeagueV4ByPuuid = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType; puuid: AccountDTOType["puuid"] }) =>
    `https://${params.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${params.puuid}`,
  key: `league-v4__by-puuid`,
  schema: v.array(LeagueDTOSchema),
});
