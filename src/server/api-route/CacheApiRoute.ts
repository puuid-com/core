import { RiotApiRoute, type ApiRouteConfigs } from "@/server/api-route/ApiRoute";
import { CacheService, type CacheDir } from "@/server/services/CacheService";
import type { Options } from "ky";
import * as v from "valibot";

type Schema = v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

export type CachedApiRouteConfigs<S extends Schema, P> = ApiRouteConfigs<S, P> & {
  R2Dir: CacheDir;
};

export type CachedApiRouteParams = {
  id: string;
};

export class CachedApiRoute<S extends Schema, P extends CachedApiRouteParams> extends RiotApiRoute<
  S,
  P
> {
  readonly R2Dir: CacheDir;

  constructor(cfg: CachedApiRouteConfigs<S, P>) {
    super(cfg);

    this.R2Dir = cfg.R2Dir;
  }

  override async call(param: P, options?: Options, checkCache = true): Promise<v.InferOutput<S>> {
    try {
      const r2Cache = checkCache ? await this.tryGetCachedDataById(param.id) : null;

      if (r2Cache) return this.parseData(r2Cache);

      await this.ensureRateLimit();

      const data = await this.fetchData(param, options);

      const parsedData = this.parseData(data);

      await CacheService.saveToCache(param.id, data, this.R2Dir);

      return parsedData;
    } catch (e) {
      console.error(e);

      throw e;
    }
  }

  public tryGetCachedDataById(id: string): Promise<v.InferOutput<S>> {
    return CacheService.tryGetFileFromCache<v.InferOutput<S>>(id, this.R2Dir);
  }
}
