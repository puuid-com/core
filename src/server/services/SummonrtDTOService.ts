import { SummonerV4ByPuuid } from "@/server/api-route/riot/SummonerRoutes";
import type { SummonerType } from "@/server/db/schema/summoner";

export class SummonerDTOService {
  static async getSummonerDTOByPuuid(
    id: Pick<SummonerType, "puuid" | "region">
  ) {
    return SummonerV4ByPuuid.call({
      region: id.region,
      puuid: id.puuid,
    });
  }
}
