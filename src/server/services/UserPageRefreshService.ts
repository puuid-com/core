import type { UserPageRowType } from "@/server/db/schema/user-page";
import { UserPageService } from "@/server/services/UserPageService";

export class UserPageRefreshService {
  static async refreshUserPage(userPageId: UserPageRowType["id"]) {
    const page = await UserPageService.getUserPageById(userPageId);
    const puuids = page.summoners.map((s) => s.puuid);

    return puuids;
  }
}
