import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/server/db/schema/auth";
import * as matchSchema from "@/server/db/schema/match";
import { serverEnv } from "@/server/lib/env/server";
import { Pool } from "pg";
import * as followingSchema from "@/server/db/schema/following";
import * as leagueSchema from "@/server/db/schema/league";
import * as refreshSchema from "@/server/db/schema/summoner-refresh";
import * as summonerSchema from "@/server/db/schema/summoner";
import * as summonerStatisticSchema from "@/server/db/schema/summoner-statistic";
import * as noteSchema from "@/server/db/schema/note";
import * as commentSchema from "@/server/db/schema/match-comments";
import * as viewsSchema from "@/server/db/schema/views";
import * as userPageSchema from "@/server/db/schema/user-page";
import * as userPageStatisticSchema from "@/server/db/schema/user-page-statistic";

const ca = Buffer.from(serverEnv.DATABASE_CRT, "base64").toString("utf8");

const pool = new Pool({
  host: serverEnv.DATABASE_HOST,
  port: serverEnv.DATABASE_PORT,
  database: serverEnv.DATABASE_NAME,
  user: serverEnv.DATABASE_USER,
  password: serverEnv.DATABASE_PASSWORD,
  ssl: { ca: ca },
});

export const db = drizzle({
  client: pool,
  schema: {
    ...authSchema,
    ...followingSchema,
    ...leagueSchema,
    ...refreshSchema,
    ...summonerSchema,
    ...summonerStatisticSchema,
    ...noteSchema,
    ...matchSchema,
    ...viewsSchema,
    ...commentSchema,
    ...userPageSchema,
    ...userPageStatisticSchema,
  },
  logger: serverEnv.PUUID_CORE_DEBUG
    ? {
        logQuery(query: string, params: unknown[]) {
          console.log("=".repeat(60));

          console.log("\n\x1b[32m[Drizzle]\x1b[0m\n");

          console.log(`Query:\n${query}\n`);
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (params && params.length > 0) {
            console.log(`Params:\n${JSON.stringify(params, null, 2)}\n`);
          }

          console.log("=".repeat(60));
        },
      }
    : false,
});

export type TransactionType = Parameters<
  Parameters<typeof db.transaction>[0]
>[0];
