import { db } from "@/server/db";
import { summonerTable } from "@/server/db/schema/summoner";
import { desc, sql } from "drizzle-orm";

export const SITEMAP_SUMMONERS_PAGE_SIZE = 1000;

export class SitemapService {
  static async getSummonerCount() {
    const rows = await db
      .select({
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(summonerTable);

    return rows[0]?.count ?? 0;
  }

  static async getSummonerPage(page: number, pageSize = SITEMAP_SUMMONERS_PAGE_SIZE) {
    const offset = Math.max(0, (page - 1) * pageSize);
    return db
      .select({ riotId: summonerTable.riotId, createdAt: summonerTable.createdAt })
      .from(summonerTable)
      .orderBy(desc(summonerTable.createdAt))
      .limit(pageSize)
      .offset(offset);
  }
}
