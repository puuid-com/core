import type { LolTierType } from "@/server/types/riot/common";

export class CDragonService {
  private static LATEST_PATCH = "latest";

  private static base(patch = this.LATEST_PATCH) {
    return `https://cdn.communitydragon.org/${patch}`;
  }

  // /:patch/champion/generic/square
  static getChampionGenericSquare(patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/generic/square`;
  }

  // /:patch/champion/:championKey|:championId/square
  static getChampionSquare(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/square`;
  }

  // /:patch/champion/:championKey|:championId/data
  static getChampionData(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/data`;
  }

  // /:patch/champion/:championKey|:championId/splash-art
  static getChampionSplashArt(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/splash-art`;
  }

  // /:patch/champion/:championKey|:championId/splash-art/skin/:skinId
  static getChampionSplashArtSkin(
    champion: string | number,
    skinId: number,
    patch = "latest",
  ): string {
    return `${this.base(patch)}/champion/${champion}/splash-art/skin/${skinId}`;
  }

  // /:patch/champion/:championKey|:championId/splash-art/centered
  static getChampionSplashArtCentered(
    champion: string | number,
    patch = this.LATEST_PATCH,
  ): string {
    return `${this.base(patch)}/champion/${champion}/splash-art/centered`;
  }

  // /:patch/champion/:championKey|:championId/splash-art/centered/skin/:skinId
  static getChampionSplashArtCenteredSkin(
    champion: string | number,
    skinId: number,
    patch = "latest",
  ): string {
    return `${this.base(patch)}/champion/${champion}/splash-art/centered/skin/${skinId}`;
  }

  // /:patch/champion/:championKey|:championId/champ-select/sounds/ban
  static getChampionChampSelectSoundsBan(
    champion: string | number,
    patch = this.LATEST_PATCH,
  ): string {
    return `${this.base(patch)}/champion/${champion}/champ-select/sounds/ban`;
  }

  // /:patch/champion/:championKey|:championId/champ-select/sounds/choose
  static getChampionChampSelectSoundsChoose(
    champion: string | number,
    patch = this.LATEST_PATCH,
  ): string {
    return `${this.base(patch)}/champion/${champion}/champ-select/sounds/choose`;
  }

  // /:patch/champion/:championKey|:championId/champ-select/sounds/sfx
  static getChampionChampSelectSoundsSfx(
    champion: string | number,
    patch = this.LATEST_PATCH,
  ): string {
    return `${this.base(patch)}/champion/${champion}/champ-select/sounds/sfx`;
  }

  // /:patch/champion/:championKey|:championId/tile
  static getChampionTile(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/tile`;
  }

  // /:patch/champion/:championKey|:championId/tile/skin/:skinId
  static getChampionTileSkin(
    champion: string | number,
    skinId: number,
    patch = this.LATEST_PATCH,
  ): string {
    return `${this.base(patch)}/champion/${champion}/tile/skin/${skinId}`;
  }

  // /:patch/champion/:championKey|:championId/portrait
  static getChampionPortrait(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/portrait`;
  }

  // /:patch/champion/:championKey|:championId/portrait/skin/:skinId
  static getChampionPortraitSkin(
    champion: string | number,
    skinId: number,
    patch = "latest",
  ): string {
    return `${this.base(patch)}/champion/${champion}/portrait/skin/${skinId}`;
  }

  // /:patch/champion/:championKey|:championId/ability-icon/passive
  static getChampionAbilityIconPassive(
    champion: string | number,
    patch = this.LATEST_PATCH,
  ): string {
    return `${this.base(patch)}/champion/${champion}/ability-icon/passive`;
  }

  // /:patch/champion/:championKey|:championId/ability-icon/p
  static getChampionAbilityIconP(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/ability-icon/p`;
  }

  // /:patch/champion/:championKey|:championId/ability-icon/q
  static getChampionAbilityIconQ(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/ability-icon/q`;
  }

  // /:patch/champion/:championKey|:championId/ability-icon/w
  static getChampionAbilityIconW(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/ability-icon/w`;
  }

  // /:patch/champion/:championKey|:championId/ability-icon/e
  static getChampionAbilityIconE(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/ability-icon/e`;
  }

  // /:patch/champion/:championKey|:championId/ability-icon/r
  static getChampionAbilityIconR(champion: string | number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/champion/${champion}/ability-icon/r`;
  }

  // /:patch/honor/generic
  static getHonorGeneric(patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/generic`;
  }

  // /:patch/honor/:honorId
  static getHonor(honorId: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/${honorId}`;
  }

  // /:patch/honor/:honorId/locked
  static getHonorLocked(honorId: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/${honorId}/locked`;
  }

  // /:patch/honor/:honorId/level/:level
  static getHonorLevel(honorId: number, level: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/${honorId}/level/${level}`;
  }

  // /:patch/honor/emblem/generic
  static getHonorEmblemGeneric(patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/emblem/generic`;
  }

  // /:patch/honor/emblem/:honorId
  static getHonorEmblem(honorId: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/emblem/${honorId}`;
  }

  // /:patch/honor/emblem/:honorId/locked
  static getHonorEmblemLocked(honorId: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/emblem/${honorId}/locked`;
  }

  // /:patch/honor/emblem/:honorId/level/:level
  static getHonorEmblemLevel(honorId: number, level: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/honor/emblem/${honorId}/level/${level}`;
  }

  // /:patch/ward/:wardId
  static getWard(wardId: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/ward/${wardId}`;
  }

  // /:patch/ward/:wardId/shadow
  static getWardShadow(wardId: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/ward/${wardId}/shadow`;
  }

  // /:patch/profile-icon/:profileIconId
  static getProfileIcon(profileIconId: number, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/profile-icon/${profileIconId}`;
  }

  static getRankMiniIcon(rank: LolTierType, patch = this.LATEST_PATCH): string {
    return `${this.base(patch)}/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-mini-crests/${rank.toLowerCase()}.svg`;
  }

  // /:patch/champion/:championKey|:championId/spell/:spellKey
  static getChampionSpell(
    champion: string | number,
    spellKey: string,
    patch = this.LATEST_PATCH,
  ): string {
    return `https://cdn.communitydragon.org/${patch}/champion/${champion}/ability-icon/${spellKey}`;
  }
}
