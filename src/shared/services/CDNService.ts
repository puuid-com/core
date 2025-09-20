import type { LolPositionType } from "@/shared/types/dto/MatchDTO";
import type { LolTierType } from "@/shared/types/riot/common";

export class CDNService {
  private static BASE_PATH = `https://cdn.puuid.com`;

  public static getTierImageUrl(tier: LolTierType) {
    return `${this.BASE_PATH}/public/image/tier/${tier.toLowerCase()}.png`;
  }

  public static getPositionImageUrl(position: LolPositionType) {
    return `${
      this.BASE_PATH
    }/public/image/position/${position.toLowerCase()}.svg`;
  }

  public static getMiniTierImageUrl(tier: LolTierType | "UNRANKED") {
    return `${this.BASE_PATH}/public/image/mini-tier/${tier.toLowerCase()}.svg`;
  }
}
