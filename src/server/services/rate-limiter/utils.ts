import type { RateLimit } from "@/server/services/rate-limiter/types";

export type TimeWindow =
  | `${number} second`
  | `${number} seconds`
  | `${number} minute`
  | `${number} minutes`
  | `${number} hour`
  | `${number} hours`;

export function parseRateLime(rateLimitStr: `${number} requests every ${TimeWindow}`): RateLimit {
  const [requests, timeWindowStr] = rateLimitStr.split(" requests every ");
  return {
    points: Number(requests),
    duration: parseTimeWindow(timeWindowStr as TimeWindow),
  };
}

export function parseTimeWindow(timeStr: TimeWindow): number {
  const match = /(\d+)\s*(second|minute|hour)s?/i.exec(timeStr);
  if (!match || match.length < 3) throw new Error(`Invalid time format: ${timeStr}`);

  const value = Number.parseInt(match[1]!);
  const unit = match[2]!.toLowerCase();

  switch (unit) {
    case "second":
      return value * 1000;
    case "minute":
      return value * 60 * 1000;
    case "hour":
      return value * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}
