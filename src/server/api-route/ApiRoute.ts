import {
  riotRateLimiter,
  type RiotApiRouteKey,
} from "@/server/api-route/riot/RiotRateLimiter";
import { lolClient } from "@/private/lolClient";
import { HTTPError, type Options } from "ky";
import * as v from "valibot";
import { serverEnv } from "@/server/lib/env/server";

export type DefaultSchema = v.BaseSchema<
  unknown,
  unknown,
  v.BaseIssue<unknown>
>;

export type ApiRouteConfigs<S extends DefaultSchema, P> = {
  key: RiotApiRouteKey;
  schema: S;
  getUrl: (p: P) => string;
};

export class RiotApiRoute<S extends DefaultSchema, P> {
  readonly configs: ApiRouteConfigs<S, P>;

  constructor(cfg: ApiRouteConfigs<S, P>) {
    this.configs = cfg;
  }

  protected async fetchResponse(param: P, options?: Options) {
    const requestOptions: Options = {
      method: "get",
      ...(options ?? {}),
    };

    const url = this.configs.getUrl(param);

    if (serverEnv.PUUID_CORE_DEBUG) {
      console.log(`> <${url}>`);
    }

    return await lolClient(url, requestOptions);
  }

  protected parseData(data: unknown): v.InferOutput<S> {
    return v.parse(this.configs.schema, data, { abortEarly: true });
  }

  public async call(param: P, options?: Options): Promise<v.InferOutput<S>> {
    const requestedAt = await riotRateLimiter.acquire(this.configs.key);

    try {
      const response = await this.fetchResponse(param, options);
      await riotRateLimiter.update(
        this.configs.key,
        response.headers,
        requestedAt
      );

      const data = await response.json<unknown>();

      return this.parseData(data);
    } catch (error) {
      if (error instanceof HTTPError) {
        await riotRateLimiter.update(
          this.configs.key,
          error.response.headers,
          requestedAt
        );
      }

      console.error(error);

      throw error;
    }
  }
}
