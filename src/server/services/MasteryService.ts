import { ChampionMasteryV4ByPuuid } from "@/server/api-route/riot/champion-mastery/ChampionMasteryRoutes";
import type { SummonerType } from "@/server/db/schema/summoner";

export class MasteryService {
  static async getMasteryBySummoner(id: Pick<SummonerType, "puuid" | "region">) {
    return await ChampionMasteryV4ByPuuid.call({
      region: id.region,
      puuid: id.puuid,
    });
  }
}
