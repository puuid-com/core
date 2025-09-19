import { CDragonService } from "@/shared/services/CDragonService";
import { Vibrant } from "node-vibrant/node";
import { NodeImage } from "@vibrant/image-node";

export class ServerColorsService {
  static async getMainColorsFromChampion(championId: number) {
    const mainChampionSplashImageUrl =
      CDragonService.getChampionSplashArtCentered(championId);

    return this.getColorsFromUrl(mainChampionSplashImageUrl);
  }

  static async getMainColorsFromChampionSkin(
    championId: number,
    skinId: number
  ) {
    const mainChampionSplashImageUrl =
      CDragonService.getChampionSplashArtCenteredSkin(championId, skinId);

    return this.getColorsFromUrl(mainChampionSplashImageUrl);
  }

  static async getMainColorsFromProfileIcon(profileIconId: number) {
    const profileIconUrl = CDragonService.getProfileIcon(profileIconId);

    return this.getColorsFromUrl(profileIconUrl);
  }

  private static async getColorsFromUrl(url: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image, status ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    const palette = await new Vibrant(buf, {
      ImageClass: NodeImage,
    }).getPalette();

    if (palette.Vibrant) {
      return {
        foregroundColor: palette.Vibrant.bodyTextColor,
        backgroundColor: palette.Vibrant.hex,
      };
    }

    return {
      foregroundColor: undefined,
      backgroundColor: undefined,
    };
  }
}
