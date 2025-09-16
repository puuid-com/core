import { db } from "@/server/db";
import { championView, type ChampionViewType } from "@/server/db/schema/views";
import { eq } from "drizzle-orm";

export class ChampionService {
  static async getChampionsData() {
    const data = await db.select().from(championView);

    return data.reduce<Record<number, ChampionViewType>>((acc, curr) => {
      acc[curr.championId] = curr;

      return acc;
    }, {});
  }

  static async getChampionData(championId: number) {
    const [data] = await db
      .select()
      .from(championView)
      .where(eq(championView.championId, championId))
      .limit(1);

    if (!data) {
      throw new Error("Champion not found");
    }

    return data;
  }
}
