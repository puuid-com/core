import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import {
  AcountRegionV1ByPuuid,
  AcountV1ByPuuid,
  AcountV1ByRiotID,
} from "@/server/api-route/riot/account/AccountRoutes";

export class AccountService {
  static async getAccountRegion(puuid: AccountDTOType["puuid"]) {
    return AcountRegionV1ByPuuid.call({
      routingValue: "europe",
      puuid,
    });
  }

  static async getAccountByRiotID(options: Pick<AccountDTOType, "gameName" | "tagLine">) {
    return AcountV1ByRiotID.call({
      routingValue: "europe",
      ...options,
    });
  }

  static async getAccountByPuuid(options: Pick<AccountDTOType, "puuid">) {
    return AcountV1ByPuuid.call({
      routingValue: "europe",
      ...options,
    });
  }
}
