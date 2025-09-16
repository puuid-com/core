import { db } from "@/server/db";
import { SummonerService } from "@/server/services/summoner/SummonerService";

const test = await db.transaction((tx) =>
  SummonerService.getOrCreateSummonerByRiotIDTx(tx, "OlivierDeschênes#00009")
);

console.log(test);
