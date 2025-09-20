import { RiotApiRoute } from "@/server/api-route/ApiRoute";
import { ActiveGameResponseSchema } from "@/shared/types/dto/ActiveGameDTO";
import { FeaturedGamesDTOSchema } from "@/shared/types/dto/FeaturedGamesDTO";
import type { SummonerType } from "@/server/db/schema/summoner";
import type { LolRegionType } from "@/shared/types/riot/common";

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
