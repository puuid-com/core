import { RiotAPIRateLimiter } from "@/server/api-route/riot/RiotRateLimiter";
import { lolClient } from "@/private/lolClient";
import { type Options } from "ky";
import * as v from "valibot";
import { serverEnv } from "@/server/lib/env/server";

type Schema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
const keys = RiotAPIRateLimiter.getKeys();

export type ApiRouteConfigs<S extends Schema, P> = {
  key: (typeof keys)[number];
  schema: S;
  getUrl: (p: P) => string;
};

export class RiotApiRoute<S extends Schema, P> {
  readonly configs: ApiRouteConfigs<S, P>;

  constructor(cfg: ApiRouteConfigs<S, P>) {
    this.configs = cfg;
  }

  protected async ensureRateLimit() {
    await RiotAPIRateLimiter.acquireOrWait(this.configs.key);
  }

  protected async fetchData(param: P, options?: Options) {
    options = {
      method: "get",
      ...(options ?? {}),
    };

    const url = this.configs.getUrl(param);

    if (serverEnv.PUUID_CORE_DEBUG) {
      console.log(`> <${url}>`);
    }

    return await lolClient(url, options).json<unknown>();
  }

  protected parseData(data: unknown): v.InferOutput<S> {
    return v.parse(this.configs.schema, data, { abortEarly: true });
  }

  public async call(param: P, options?: Options): Promise<v.InferOutput<S>> {
    await this.ensureRateLimit();

    try {
      const data = await this.fetchData(param, options);

      return this.parseData(data);
    } catch (e) {
      console.error(e);

      throw e;
    }
  }
}
