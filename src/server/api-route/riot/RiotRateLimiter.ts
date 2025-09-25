const rateLimitHeaderNames = {
  appLimit: "x-app-rate-limit",
  appCount: "x-app-rate-limit-count",
  methodLimit: "x-method-rate-limit",
  methodCount: "x-method-rate-limit-count",
} as const;

const logLimiter = (...args: unknown[]) =>
  console.log("[riot-rate-limit]", ...args);

const routeKeys = [
  "champion-v3__champion-rotations",
  "summoner-v4__by-puuid",
  "summoner-v4__me",
  "league-v4__challenger-leagues",
  "league-v4__by-leagueId",
  "league-v4__master-leagues",
  "league-v4__grandmaster-leagues",
  "league-v4__by-division",
  "league-v4__by-puuid",
  "league-exp-v4__by-division",
  "account-v1__by-riot-id",
  "account-v1__by-puuid",
  "account-v1__active-shards",
  "account-v1__region",
  "account-v1__me",
  "match-v5__by-matchId",
  "match-v5__ids",
  "match-v5__timeline",
  "champion-mastery-v4__by-puuid",
  "champion-mastery-v4__by-champion",
  "champion-mastery-v4__scores",
  "champion-mastery-v4__top",
  "spectator_featured-games",
  "spectator_by-puuid",
] as const;

export type RiotApiRouteKey = (typeof routeKeys)[number];

export const riotApiRouteKeys = routeKeys;

const GLOBAL_KEY = "__riot_app__";

type RateLimitWindowConfig = {
  limit: number;
  windowSeconds: number;
};

type StaticMethodLimitConfig = Partial<
  Record<RiotApiRouteKey, RateLimitWindowConfig[]>
>;

export type RiotRateLimiterOptions = {
  safetyMargin?: number;
  staticAppLimits?: RateLimitWindowConfig[];
  staticMethodLimits?: StaticMethodLimitConfig;
  staticMethodDefaultLimits?: RateLimitWindowConfig[];
};

const DEFAULT_APP_LIMITS: RateLimitWindowConfig[] = [
  { limit: 20, windowSeconds: 1 },
  { limit: 100, windowSeconds: 120 },
];

const DEFAULT_METHOD_LIMITS: RateLimitWindowConfig[] = [
  { limit: 20, windowSeconds: 1 },
  { limit: 100, windowSeconds: 120 },
];

const DEFAULT_STATIC_METHOD_LIMITS: StaticMethodLimitConfig = {
  "champion-v3__champion-rotations": [
    { limit: 30, windowSeconds: 10 },
    { limit: 500, windowSeconds: 600 },
  ],
  "summoner-v4__by-puuid": [{ limit: 1600, windowSeconds: 60 }],
  "summoner-v4__me": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "league-v4__challenger-leagues": [
    { limit: 30, windowSeconds: 10 },
    { limit: 500, windowSeconds: 600 },
  ],
  "league-v4__by-leagueId": [{ limit: 500, windowSeconds: 10 }],
  "league-v4__master-leagues": [
    { limit: 30, windowSeconds: 10 },
    { limit: 500, windowSeconds: 600 },
  ],
  "league-v4__grandmaster-leagues": [
    { limit: 30, windowSeconds: 10 },
    { limit: 500, windowSeconds: 600 },
  ],
  "league-v4__by-division": [{ limit: 50, windowSeconds: 10 }],
  "league-v4__by-puuid": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "league-exp-v4__by-division": [{ limit: 50, windowSeconds: 10 }],
  "account-v1__by-riot-id": [{ limit: 1000, windowSeconds: 60 }],
  "account-v1__by-puuid": [{ limit: 1000, windowSeconds: 60 }],
  "account-v1__active-shards": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "account-v1__region": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "account-v1__me": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "match-v5__by-matchId": [{ limit: 2000, windowSeconds: 10 }],
  "match-v5__ids": [{ limit: 2000, windowSeconds: 10 }],
  "match-v5__timeline": [{ limit: 2000, windowSeconds: 10 }],
  "champion-mastery-v4__by-puuid": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "champion-mastery-v4__by-champion": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "champion-mastery-v4__scores": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "champion-mastery-v4__top": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "spectator_featured-games": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
  "spectator_by-puuid": [
    { limit: 20000, windowSeconds: 10 },
    { limit: 1200000, windowSeconds: 600 },
  ],
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type RateHeaderEntry = {
  windowSeconds: number;
  value: number;
};

type RateLimitBucket = {
  limit: number;
  windowSeconds: number;
  count: number;
};

type RateLimitSnapshot = {
  app: RateLimitBucket[];
  method: RateLimitBucket[];
};

type HeaderGetter = {
  get(name: string): string | null;
};

const isFiniteNumber = (value: number) => Number.isFinite(value);

const parseRateHeader = (value: string | null): RateHeaderEntry[] => {
  if (!value) return [];

  return value
    .split(",")
    .map((part) => part.trim())
    .map<RateHeaderEntry | null>((part) => {
      const [valueStr, windowStr] = part.split(":");
      const parsedValue = Number(valueStr);
      const parsedWindow = Number(windowStr);

      if (isFiniteNumber(parsedValue) && isFiniteNumber(parsedWindow)) {
        return { windowSeconds: parsedWindow, value: parsedValue };
      }

      return null;
    })
    .filter((entry): entry is RateHeaderEntry => entry !== null);
};

const mergeLimitsWithCounts = (
  limits: RateHeaderEntry[],
  counts: RateHeaderEntry[]
): RateLimitBucket[] => {
  if (!limits.length) return [];

  const countByWindow = new Map<number, number>(
    counts.map((count) => [count.windowSeconds, count.value])
  );

  return limits.map<RateLimitBucket>((limit) => ({
    limit: limit.value,
    windowSeconds: limit.windowSeconds,
    count: countByWindow.get(limit.windowSeconds) ?? 0,
  }));
};

const formatBucket = (
  scope: "app" | "method",
  route: RiotApiRouteKey,
  bucket: RateLimitBucket
) =>
  `${scope} :: ${route} => ${bucket.count}/${bucket.limit} in ${bucket.windowSeconds}s`;

const shouldWarn = (bucket: RateLimitBucket) => {
  if (bucket.limit <= 0) return false;
  const ratio = bucket.count / bucket.limit;

  return ratio >= 0.8;
};

const readSnapshot = (headers: HeaderGetter): RateLimitSnapshot | null => {
  const appLimits = parseRateHeader(headers.get(rateLimitHeaderNames.appLimit));
  const appCounts = parseRateHeader(headers.get(rateLimitHeaderNames.appCount));
  const methodLimits = parseRateHeader(
    headers.get(rateLimitHeaderNames.methodLimit)
  );
  const methodCounts = parseRateHeader(
    headers.get(rateLimitHeaderNames.methodCount)
  );

  if (!appLimits.length && !methodLimits.length) {
    return null;
  }

  return {
    app: mergeLimitsWithCounts(appLimits, appCounts),
    method: mergeLimitsWithCounts(methodLimits, methodCounts),
  };
};

export const checkRiotRateLimit = (
  route: RiotApiRouteKey,
  headers: HeaderGetter
): RateLimitSnapshot | null => {
  const snapshot = readSnapshot(headers);

  if (!snapshot) return null;

  const buckets = [
    ...snapshot.app.map((bucket) => ({ bucket, scope: "app" as const })),
    ...snapshot.method.map((bucket) => ({
      bucket,
      scope: "method" as const,
    })),
  ];

  for (const { bucket, scope } of buckets) {
    if (!shouldWarn(bucket)) continue;

    console.warn(
      `[riot] rate limit nearing: ${formatBucket(scope, route, bucket)}`
    );
  }

  return snapshot;
};

export type { RateLimitSnapshot };

type BucketState = {
  limit: number;
  windowMs: number;
  hits: number[];
  blockedUntil: number;
};

type RouteState = Map<number, BucketState>;

const pruneHits = (bucket: BucketState, now: number) => {
  const threshold = now - bucket.windowMs;
  let firstValidIndex = 0;

  while (
    firstValidIndex < bucket.hits.length &&
    bucket.hits[firstValidIndex]! <= threshold
  ) {
    firstValidIndex++;
  }

  if (firstValidIndex > 0) {
    bucket.hits.splice(0, firstValidIndex);
  }
};

const waitForBucket = (bucket: BucketState, now: number) => {
  pruneHits(bucket, now);

  let waitMs = 0;

  if (bucket.blockedUntil > now) {
    waitMs = Math.max(waitMs, bucket.blockedUntil - now);
  }

  if (bucket.hits.length >= bucket.limit && bucket.hits.length > 0) {
    const earliest = bucket.hits[0];
    waitMs = Math.max(waitMs, earliest! + bucket.windowMs - now);
  }

  return waitMs;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class RiotRateLimiter {
  private states = new Map<string, RouteState>();
  private mutex: Promise<void> = Promise.resolve();
  private readonly safetyMargin: number;
  private readonly staticAppLimits: RateLimitWindowConfig[];
  private readonly staticMethodLimits: StaticMethodLimitConfig;
  private readonly staticMethodDefaultLimits: RateLimitWindowConfig[];

  constructor(options: RiotRateLimiterOptions = {}) {
    this.safetyMargin = clamp(options.safetyMargin ?? 0.8, 0.05, 1);
    this.staticAppLimits = options.staticAppLimits ?? DEFAULT_APP_LIMITS;
    this.staticMethodLimits =
      options.staticMethodLimits ?? DEFAULT_STATIC_METHOD_LIMITS;
    this.staticMethodDefaultLimits =
      options.staticMethodDefaultLimits ?? DEFAULT_METHOD_LIMITS;

    this.initializeStaticState();
  }

  private withLock<T>(fn: () => Promise<T> | T): Promise<T> {
    const previous = this.mutex;
    let release: () => void = () => {};

    this.mutex = new Promise<void>((resolve) => {
      release = resolve;
    });

    return previous
      .catch(() => {
        // ignore errors in the lock chain, we only care about serialization
      })
      .then(() => fn())
      .finally(() => release());
  }

  private initializeStaticState() {
    const now = Date.now();

    if (this.staticAppLimits.length) {
      const appBuckets = this.staticAppLimits.map<RateLimitBucket>(
        (bucket) => ({
          limit: bucket.limit,
          windowSeconds: bucket.windowSeconds,
          count: 0,
        })
      );

      this.applySnapshot(GLOBAL_KEY, "app", appBuckets, now, "global");
    }

    for (const route of riotApiRouteKeys) {
      const configured = this.staticMethodLimits[route];
      const buckets = (
        configured ?? this.staticMethodDefaultLimits
      ).map<RateLimitBucket>((bucket) => ({
        limit: bucket.limit,
        windowSeconds: bucket.windowSeconds,
        count: 0,
      }));

      if (!buckets.length) continue;

      this.applySnapshot(route, "method", buckets, now, route);
    }
  }

  private getRouteState(route: string): RouteState | undefined {
    return this.states.get(route);
  }

  private ensureRouteState(route: string): RouteState {
    let state = this.states.get(route);
    if (!state) {
      state = new Map();
      this.states.set(route, state);
    }
    return state;
  }

  private registerHit(
    route: string,
    timestamp: number,
    dedupe = false,
    referenceTime = Date.now()
  ) {
    const state = this.states.get(route);
    if (!state) return false;

    let recorded = false;

    for (const bucket of state.values()) {
      pruneHits(bucket, referenceTime);

      if (dedupe) {
        const last = bucket.hits.length
          ? bucket.hits[bucket.hits.length - 1]
          : undefined;
        if (last === timestamp) {
          continue;
        }
      }

      bucket.hits.push(timestamp);
      recorded = true;
    }

    return recorded;
  }

  private computeWait(route: string, now: number) {
    const state = this.getRouteState(route);
    if (!state) return 0;

    let waitMs = 0;

    for (const bucket of state.values()) {
      waitMs = Math.max(waitMs, waitForBucket(bucket, now));
    }

    return waitMs;
  }

  private applySnapshot(
    routeKey: string,
    scope: "app" | "method",
    buckets: RateLimitBucket[],
    now: number,
    context: RiotApiRouteKey | "global"
  ) {
    if (!buckets.length) return;

    const state = this.ensureRouteState(routeKey);

    for (const bucket of buckets) {
      const windowMs = bucket.windowSeconds * 1000;
      let bucketState = state.get(bucket.windowSeconds);
      const wasBlocked = bucketState ? bucketState.blockedUntil > now : false;
      const safeLimit = this.applySafetyMargin(bucket.limit);

      if (!bucketState) {
        bucketState = {
          limit: safeLimit,
          windowMs,
          hits: [],
          blockedUntil: 0,
        };
        state.set(bucket.windowSeconds, bucketState);
      } else {
        bucketState.limit = safeLimit;
        bucketState.windowMs = windowMs;
      }

      pruneHits(bucketState, now);

      const reachedRealLimit = bucket.limit > 0 && bucket.count >= bucket.limit;
      const reachedSafeLimit = safeLimit > 0 && bucket.count >= safeLimit;

      if (reachedRealLimit || reachedSafeLimit) {
        bucketState.blockedUntil = Math.max(
          bucketState.blockedUntil,
          now + windowMs
        );
      } else {
        bucketState.blockedUntil = 0;
        if (wasBlocked) {
          logLimiter(
            `🟢 reset ${scope} limit for ${context} (window ${bucket.windowSeconds}s)`
          );
        }
      }
    }
  }

  private applySafetyMargin(limit: number) {
    if (limit <= 0) return limit;

    if (this.safetyMargin >= 1) return limit;

    const adjusted = Math.floor(limit * this.safetyMargin);

    return adjusted > 0 ? adjusted : 1;
  }

  public async acquire(route: RiotApiRouteKey): Promise<number> {
    while (true) {
      const result = await this.withLock(() => {
        const now = Date.now();
        const globalWait = this.computeWait(GLOBAL_KEY, now);
        const routeWait = this.computeWait(route, now);
        const waitMs = Math.max(globalWait, routeWait);

        if (waitMs <= 0) {
          const timestamp = Date.now();
          this.registerHit(GLOBAL_KEY, timestamp, false, timestamp);
          this.registerHit(route, timestamp, false, timestamp);

          return {
            waitMs: 0,
            timestamp,
          };
        }

        const reason =
          routeWait >= globalWait && routeWait > 0 ? "method" : "app (global)";
        logLimiter(
          `⏳ waiting ${waitMs}ms for ${route} — ${reason} window cooldown (app ${globalWait}ms, method ${routeWait}ms)`
        );

        return { waitMs, timestamp: undefined };
      });

      if (result.waitMs === 0 && result.timestamp !== undefined) {
        return result.timestamp;
      }

      await delay(result.waitMs);
    }
  }

  public async update(
    route: RiotApiRouteKey,
    headers: HeaderGetter,
    requestedAt: number
  ) {
    const snapshot = checkRiotRateLimit(route, headers);

    if (!snapshot) return;

    const now = Date.now();

    await this.withLock(() => {
      this.applySnapshot(GLOBAL_KEY, "app", snapshot.app, now, "global");
      this.applySnapshot(route, "method", snapshot.method, now, route);

      this.registerHit(GLOBAL_KEY, requestedAt, true, now);
      this.registerHit(route, requestedAt, true, now);
    });

    const formatBucket = (bucket: RateLimitBucket) =>
      `${bucket.count}/${bucket.limit}@${bucket.windowSeconds}s`;

    const appSummary = snapshot.app.length
      ? snapshot.app.map(formatBucket).join(" ")
      : "—";
    const methodSummary = snapshot.method.length
      ? snapshot.method.map(formatBucket).join(" ")
      : "—";

    const icon = snapshot.app
      .concat(snapshot.method)
      .some((bucket) => bucket.count >= bucket.limit)
      ? "⚠️"
      : "✅";

    logLimiter(
      `${icon} ${route} | app ${appSummary} | method ${methodSummary}`
    );
  }
}

export const riotRateLimiter = new RiotRateLimiter();
