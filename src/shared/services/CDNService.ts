import type { LolPositionType } from "@/server/api-route/riot/match/MatchDTO";
import type { LolTierType } from "@/server/types/riot/common";

export class CDNService {
  private static BASE_PATH = `https://cdn.puuid.com`;

  public static getTierImageUrl(tier: LolTierType) {
    return `https://cdn.puuid.com/public/image/tier/${tier.toLowerCase()}.png`;
  }

  public static getPositionImageUrl(position: LolPositionType) {
    return `https://cdn.puuid.com/public/image/position/${position.toLowerCase()}.svg`;
  }
}
