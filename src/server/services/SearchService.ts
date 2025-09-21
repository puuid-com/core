import { SummonerService } from "@/server/services/SummonerService";
import { UserPageService } from "@/server/services/UserPageService";

export class SearchService {
  static async searchSummonersAndUserPage(options: {
    search: string;
    limit?: number;
    userId?: string;
    excludeSummoners?: boolean;
    excludeUserPages?: boolean;
  }) {
    // The limit will be split equally between pages and summoner
    const {
      search,
      limit = 6,
      userId,
      excludeSummoners = false,
      excludeUserPages = false,
    } = options;

    const trimmedSearch = search.trim();

    if (!trimmedSearch || (excludeSummoners && excludeUserPages)) {
      return {
        summoners: [],
        userPages: [],
      };
    }

    const half = Math.floor(limit / 2);
    const remainder = limit % 2;

    const summonerLimit = half + remainder;
    const userPageLimit = half;

    const [summoners, userPages] = await Promise.all([
      summonerLimit > 0 && !excludeSummoners
        ? SummonerService.searchSummoners({
            search: trimmedSearch,
            limit: summonerLimit,
            userId,
          })
        : Promise.resolve([]),
      userPageLimit > 0 && !excludeUserPages
        ? UserPageService.searchUserPage({
            search: trimmedSearch,
            limit: userPageLimit,
          })
        : Promise.resolve([]),
    ]);

    return {
      summoners,
      userPages,
    };
  }
}
