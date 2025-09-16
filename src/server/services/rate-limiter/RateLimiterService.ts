import {
  RateLimiterMemory,
  RateLimiterUnion,
  RateLimiterRes,
  type IRateLimiterOptions,
} from "rate-limiter-flexible";

export class MultiRouteLimiter<RouteName extends string> {
  private globalLimiters: RateLimiterMemory[];
  private routeDefs = new Map<RouteName, IRateLimiterOptions[]>();
  private unions = new Map<RouteName, RateLimiterUnion>();
  private routeCache = new Map<RouteName, RateLimiterMemory[]>();

  constructor(
    globalLimits: IRateLimiterOptions[],
    routeLimits?: Record<RouteName, IRateLimiterOptions[]>,
  ) {
    this.globalLimiters = globalLimits.map(
      (lim, i) =>
        new RateLimiterMemory({
          keyPrefix: `g_${i}_${lim.points}_${lim.duration}`,
          points: lim.points,
          duration: lim.duration,
        }),
    );
    if (routeLimits)
      for (const [r, limits] of Object.entries(routeLimits))
        this.routeDefs.set(r as RouteName, limits as IRateLimiterOptions[]);
  }

  public getKeys() {
    return this.routeDefs.keys().toArray();
  }

  private buildRoute(route: RouteName) {
    const c = this.routeCache.get(route);
    if (c) return c;
    const defs = this.routeDefs.get(route) ?? [];
    const lims = defs.map(
      (lim, i) =>
        new RateLimiterMemory({
          keyPrefix: `r_${route}_${i}_${lim.points}_${lim.duration}`,
          points: lim.points,
          duration: lim.duration,
        }),
    );
    this.routeCache.set(route, lims);
    return lims;
  }

  private getUnion(route: RouteName) {
    const u = this.unions.get(route);
    if (u) return u;
    const union = new RateLimiterUnion(...this.globalLimiters, ...this.buildRoute(route));
    this.unions.set(route, union);
    return union;
  }

  async acquire(route: RouteName, points = 1) {
    return this.getUnion(route).consume("all", points);
  }

  async acquireOrWait(route: RouteName, points = 1) {
    try {
      await this.getUnion(route).consume("all", points);
    } catch (e) {
      const rej = e as Record<RouteName, RateLimiterRes>;

      const catched = Object.values<RateLimiterRes>(rej);
      const msBeforeNext = Math.max(...catched.map((r) => r.msBeforeNext));

      await new Promise((r) => setTimeout(r, msBeforeNext));
      await this.getUnion(route).consume("all", points);
    }
  }
}
