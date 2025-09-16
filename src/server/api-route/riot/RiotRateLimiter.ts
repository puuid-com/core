import { MultiRouteLimiter } from "@/server/services/rate-limiter/RateLimiterService";
import { parseRateLime } from "@/server/services/rate-limiter/utils";
import type { IRateLimiterOptions } from "rate-limiter-flexible";

const globalLimits: IRateLimiterOptions[] = [
  { points: 500, duration: 10 },
  { points: 30_000, duration: 600 },
];

export const RiotAPIRateLimiter = new MultiRouteLimiter(globalLimits, {
  /**
   * champion-v3
   */
  "champion-v3__champion-rotations": [
    parseRateLime("30 requests every 10 seconds"),
    parseRateLime("500 requests every 10 minutes"),
  ],
  /**
   * summoner-v4
   */
  "summoner-v4__by-puuid": [parseRateLime("1600 requests every 1 minutes")],
  "summoner-v4__me": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  /**
   * league-v4
   */
  "league-v4__challenger-leagues": [
    parseRateLime("30 requests every 10 seconds"),
    parseRateLime("500 requests every 10 minutes"),
  ],
  "league-v4__by-leagueId": [parseRateLime("500 requests every 10 seconds")],
  "league-v4__master-leagues": [
    parseRateLime("30 requests every 10 seconds"),
    parseRateLime("500 requests every 10 minutes"),
  ],
  "league-v4__grandmaster-leagues": [
    parseRateLime("30 requests every 10 seconds"),
    parseRateLime("500 requests every 10 minutes"),
  ],
  "league-v4__by-division": [parseRateLime("50 requests every 10 seconds")],
  "league-v4__by-puuid": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  /**
   * league-exp-v4
   */
  "league-exp-v4__by-division": [parseRateLime("50 requests every 10 seconds")],
  /**
   * account-v1
   */
  "account-v1__by-riot-id": [parseRateLime("1000 requests every 1 minutes")],
  "account-v1__by-puuid": [parseRateLime("1000 requests every 1 minutes")],
  "account-v1__active-shards": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  "account-v1__region": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  "account-v1__me": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  /**
   * match-v5
   */
  "match-v5__by-matchId": [parseRateLime("2000 requests every 10 seconds")],
  "match-v5__ids": [parseRateLime("2000 requests every 10 seconds")],
  "match-v5__timeline": [parseRateLime("2000 requests every 10 seconds")],
  /**
   * champion-mastery-v4
   */
  "champion-mastery-v4__by-puuid": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  "champion-mastery-v4__by-champion": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  "champion-mastery-v4__scores": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  "champion-mastery-v4__top": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  /**
   * spectator-v5
   */
  "spectator_featured-games": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  "spectator_by-puuid": [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
});
