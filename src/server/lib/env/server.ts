import { createEnv } from "@t3-oss/env-core";
import * as v from "valibot";

export const serverEnv = createEnv({
  server: {
    RIOT_API_KEY: v.string(),
    RIOT_DEFAULT_ROUTING_VALUE: v.picklist(["americas", "europe", "asia", "sea"]),
    RIOT_CLIENT_ID: v.string(),
    RIOT_CLIENT_SECRET: v.string(),

    R2_END_POINT: v.string(),
    R2_ACCESS_KEY: v.string(),
    R2_SECRET_KEY: v.string(),
    R2_TOKEN: v.string(),
    R2_CDN_URL: v.string(),

    DATABASE_HOST: v.string(),
    DATABASE_PORT: v.pipe(v.string(), v.transform(Number)),
    DATABASE_USER: v.string(),
    DATABASE_PASSWORD: v.string(),
    DATABASE_NAME: v.string(),

    GITHUB_CLIENT_ID: v.string(),
    GITHUB_CLIENT_SECRET: v.string(),

    BETTER_AUTH_URL: v.string(),
  },
  extends: [],
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
