import { RiotApiRoute } from "@/server/api-route/ApiRoute";
import { ActiveGameResponseSchema } from "@/server/api-route/riot/spectator/ActiveGameDTO";
import { FeaturedGamesDTOSchema } from "@/server/api-route/riot/spectator/FeaturedGamesDTO";
import type { SummonerType } from "@/server/db/schema/summoner";
import type { LolRegionType } from "@/server/types/riot/common";

export const SpectatorFeaturedGamesRoute = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType }) =>
    `https://${params.region}.api.riotgames.com/lol/spectator/v5/featured-games`,
  key: `spectator_featured-games`,
  schema: FeaturedGamesDTOSchema,
});

export const SpectatorActiveGameRoute = new RiotApiRoute({
  getUrl: (params: { region: LolRegionType; puuid: SummonerType["puuid"] }) =>
    `https://${params.region}.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${params.puuid}`,
  key: `spectator_by-puuid`,
  schema: ActiveGameResponseSchema,
});
