import { RiotApiRoute } from "@/server/api-route/ApiRoute";
import { CachedApiRoute } from "@/server/api-route/CacheApiRoute";
import type { AccountDTOType } from "@/shared/types/dto/AccountDTO";
import { type MatchDTOType, MatchDTOSchema } from "@/shared/types/dto/MatchDTO";
import { MatchTimelineDTOSchema } from "@/shared/types/dto/MatchTimelineDTO";
import type { LolRoutingValueType } from "@/shared/types/riot/common";
import * as v from "valibot";

export const MatchIdsV5ByPuuid = new RiotApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    puuid: AccountDTOType["puuid"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${params.puuid}/ids`,
  key: `match-v5__ids`,
  schema: v.array(v.string()),
});

export const MatchV5ByID = new CachedApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    id: MatchDTOType["metadata"]["matchId"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/lol/match/v5/matches/${params.id}`,
  key: `match-v5__by-matchId`,
  schema: MatchDTOSchema,
  R2Dir: "match",
});

export const MatchTimelineV5ByID = new CachedApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    id: MatchDTOType["metadata"]["matchId"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/lol/match/v5/matches/${params.id}/timeline`,
  key: `match-v5__timeline`,
  schema: MatchTimelineDTOSchema,
  R2Dir: "match-timeline",
});
