import type { MatchDTOType } from "@/shared/types/dto/MatchDTO";
import {
  MatchTimelineV5ByID,
  MatchIdsV5ByPuuid,
  MatchV5ByID,
} from "@/server/api-route/riot/MatchRoutes";
import {
  MatchIDsQueryParamsSchema,
  type InputPagedMatchIDsQueryParams,
  type OutputPagedMatchIDsQueryParams,
} from "@/server/services/match/type";
import {
  routingValueFromRegion,
  type LolRegionType,
} from "@/shared/types/riot/common";
import {
  and,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  not,
  or,
  sql,
  type SQLWrapper,
} from "drizzle-orm";
import { db, type TransactionType } from "@/server/db";
import {
  matchTable,
  matchSummonerTable,
  type MatchInsertType,
  type MatchRowType,
  type MatchWithSummonersType,
  type MatchSummonerRowType,
  type MatchResultType,
} from "@/server/db/schema/match";
import * as v from "valibot";
import { summonerTable, type SummonerType } from "@/server/db/schema/summoner";
import type { PartialOmit } from "@/shared/types/utils";
import { alias } from "drizzle-orm/pg-core";
import type { LolQueueType } from "@/shared/types/dto/LeagueDTO";
import { LOL_QUEUES } from "@/shared/types/riot/queues";

export type GetMatchesFiltersType = {
  playedChampionIds: number[]; // pc
  matchupChampionIds: number[]; // mc
  teammatePuuids: string[]; // t
  ennemyPuuids: string[]; // pa
  gameResult: boolean; // w
  global: string; // c
  resultType: MatchResultType;
  page: number;
  queueId: number;
  limit: number;
};

export const defaultMatchesFilters: PartialOmit<
  GetMatchesFiltersType,
  "page" | "limit"
> = {
  page: 1,
  limit: 10,
};

export class MatchService {
  private static riotMatchQueryParamsToCacheWhereConditions(
    summoner: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams,
    resultType?: MatchResultType
  ) {
    const conditions = [ilike(matchTable.matchId, `${summoner.region}_%`)];

    if (params.queue) {
      conditions.push(eq(matchTable.queueId, params.queue));
    }

    if (resultType) {
      conditions.push(eq(matchTable.resultType, resultType));
    }

    return and(...conditions);
  }

  static async getMatchIdsDTOByPuuidPaged(
    summoner: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams
  ) {
    const ids = await MatchIdsV5ByPuuid.call(
      {
        routingValue: routingValueFromRegion(summoner.region),
        puuid: summoner.puuid,
      },
      {
        searchParams: {
          ...params,
          startTime: params.startTime ?? this.MIN_START_TIME,
        },
      }
    );

    return {
      ids,
      next_start:
        ids.length === params.count ? params.start + params.count : null,
    };
  }

  static async getMatchTimelineDTOById(id: string) {
    return MatchTimelineV5ByID.call({
      routingValue: routingValueFromRegion(
        id.split("_")[0]!.toLowerCase() as LolRegionType
      ),
      id,
    });
  }

  private static getRegionFromMatchId(id: string) {
    return id.split("_")[0]!.toLowerCase() as LolRegionType;
  }

  static async getMatchDTOById(
    id: string,
    checkCache = true
  ): Promise<MatchDTOType> {
    return MatchV5ByID.call(
      {
        id: id,
        routingValue: routingValueFromRegion(this.getRegionFromMatchId(id)),
      },
      undefined,
      checkCache
    );
  }

  private static matchDTOtoDB(matchDTO: MatchDTOType): {
    match: MatchRowType;
    summoners: MatchSummonerRowType[];
  } {
    /*
     * Not sure about the logic, can't really tell if the team actually FF or remake.
     */
    const isSurrender = matchDTO.info.participants.some(
      (p) => p.teamEarlySurrendered
    );
    const isRemake = matchDTO.info.gameCreation <= 5 * 60;

    const match: MatchInsertType = {
      matchId: matchDTO.metadata.matchId,
      gameCreationMs: matchDTO.info.gameStartTimestamp,
      gameDurationSec: matchDTO.info.gameDuration,
      queueId: matchDTO.info.queueId,
      platformId: matchDTO.info.platformId,
      resultType: isSurrender || isRemake ? "SURRENDER" : "NORMAL",
    };

    const summoners: MatchSummonerRowType[] = matchDTO.info.participants.map(
      (p) => {
        const position = p.teamPosition;
        const vsSummoner = matchDTO.info.participants.find(
          (s) => s.teamPosition === position && s.puuid !== p.puuid
        );

        const vsSummonerPuuid = vsSummoner?.puuid ?? null;

        return {
          matchId: matchDTO.metadata.matchId,
          gameCreationMs: matchDTO.info.gameStartTimestamp,
          puuid: p.puuid,
          gameName: p.riotIdGameName,
          tagLine: p.riotIdTagline,
          profileIconId: p.profileIcon,

          position: position,

          teamId: p.teamId,
          win: p.win,

          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,

          totalDamageDealtToChampions: p.totalDamageDealtToChampions,
          totalDamageTaken: p.totalDamageTaken,

          championId: p.championId,
          champLevel: p.champLevel,

          items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5],

          cs: p.totalMinionsKilled,

          vsSummonerPuuid: vsSummonerPuuid,

          damageDealtToObjectives: p.damageDealtToObjectives,
          dragonKills: p.dragonKills,
          visionScore: p.visionScore,
          largestCriticalStrike: p.largestCriticalStrike,
          soloKills: 0,
          wardTakedowns: p.wardsKilled,
          inhibitorKills: p.inhibitorKills,
          turretKills: p.turretKills,

          spellIds: [p.summoner1Id, p.summoner2Id],
        };
      }
    );

    return {
      match,
      summoners,
    };
  }

  static async getMatchesDTOByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams
  ) {
    const { ids, next_start } = await MatchService.getMatchIdsDTOByPuuidPaged(
      id,
      params
    );

    const matches = await Promise.all(
      ids.map((id) => this.getMatchDTOById(id))
    );

    return {
      data: matches,
      next_start,
    };
  }

  static async getMatchesDBByMatchIds(matchIds: MatchRowType["matchId"][]) {
    return db.query.matchTable.findMany({
      where: inArray(matchTable.matchId, matchIds),
      with: {
        summoners: true,
      },
    });
  }

  static async getMatchesDBByPuuidSmall(
    id: Pick<SummonerType, "region" | "puuid">,
    params: InputPagedMatchIDsQueryParams
  ) {
    const _param = v.parse(MatchIDsQueryParamsSchema, params);

    const conditions = this.riotMatchQueryParamsToCacheWhereConditions(
      id,
      _param
    );

    return db
      .select()
      .from(matchSummonerTable)
      .innerJoin(matchTable, eq(matchSummonerTable.matchId, matchTable.matchId))
      .where(and(eq(matchSummonerTable.puuid, id.puuid), conditions))
      .limit(_param.count)
      .offset(_param.start)
      .orderBy(desc(matchTable.gameCreationMs), desc(matchTable.matchId));
  }

  static async getAllMatchesDBByRiotIDSmall(
    id: Pick<SummonerType, "riotId">,
    params: Pick<InputPagedMatchIDsQueryParams, "queue">
  ) {
    const _param = v.parse(MatchIDsQueryParamsSchema, params);

    return db
      .select()
      .from(matchSummonerTable)
      .innerJoin(matchTable, eq(matchSummonerTable.matchId, matchTable.matchId))
      .innerJoin(
        summonerTable,
        eq(matchSummonerTable.puuid, summonerTable.puuid)
      )
      .where(
        and(
          eq(summonerTable.riotId, id.riotId),
          eq(matchTable.queueId, _param.queue),
          eq(sql`lower(${matchTable.platformId})`, summonerTable.region)
        )
      )
      .orderBy(desc(matchTable.gameCreationMs), desc(matchTable.matchId));
  }

  static async getMatchesDBByPuuidFull(
    id: Pick<SummonerType, "region" | "puuid">,
    _filters: Partial<GetMatchesFiltersType> = {}
  ) {
    const filters = {
      ...defaultMatchesFilters,
      ..._filters,
    };

    const offset = (filters.page - 1) * filters.limit;

    const msSelf = alias(matchSummonerTable, "ms_self");

    const { puuid } = id;
    const has = <T>(xs: T[] | undefined): xs is T[] =>
      Array.isArray(xs) && xs.length > 0;

    const baseSelfConds: SQLWrapper[] = [
      eq(msSelf.puuid, puuid),
      filters.gameResult !== undefined && eq(msSelf.win, filters.gameResult),
      has(filters.playedChampionIds) &&
        inArray(msSelf.championId, filters.playedChampionIds),
    ].filter(Boolean) as SQLWrapper[];

    const teammateClause = has(filters.teammatePuuids)
      ? and(
          eq(matchSummonerTable.teamId, msSelf.teamId),
          inArray(matchSummonerTable.puuid, filters.teammatePuuids)
        )
      : undefined;

    const enemyClause = has(filters.ennemyPuuids)
      ? and(
          not(eq(matchSummonerTable.teamId, msSelf.teamId)),
          inArray(matchSummonerTable.puuid, filters.ennemyPuuids)
        )
      : undefined;

    const matchupClause = has(filters.matchupChampionIds)
      ? and(
          // the specific opponent you faced
          eq(matchSummonerTable.puuid, msSelf.vsSummonerPuuid),
          inArray(matchSummonerTable.championId, filters.matchupChampionIds)
        )
      : undefined;

    // any of teammate, enemy, or matchup may satisfy the subquery
    const mergedExists =
      (has(filters.teammatePuuids) ||
        has(filters.ennemyPuuids) ||
        has(filters.matchupChampionIds)) &&
      exists(
        db
          .select({ _: sql<number>`1` })
          .from(matchSummonerTable)
          .where(
            and(
              eq(matchSummonerTable.matchId, msSelf.matchId),
              not(eq(matchSummonerTable.puuid, msSelf.puuid)),
              and(
                ...[teammateClause, enemyClause, matchupClause].filter(Boolean)
              )
            )
          )
      );

    const matchConds: SQLWrapper[] = [
      filters.resultType && eq(matchTable.resultType, filters.resultType),
      filters.queueId !== undefined && eq(matchTable.queueId, filters.queueId),
    ].filter(Boolean) as SQLWrapper[];

    const allWhere = [
      ...baseSelfConds,
      mergedExists as SQLWrapper | undefined,
      ...matchConds,
    ].filter(Boolean) as SQLWrapper[];

    const pageCte = db.$with("page_matches").as(
      db
        .select({
          matchId: msSelf.matchId,
        })
        .from(msSelf)
        .innerJoin(matchTable, eq(matchTable.matchId, msSelf.matchId))
        .where(and(...allWhere))
        .orderBy(desc(msSelf.gameCreationMs), desc(msSelf.matchId))
        .limit(filters.limit)
        .offset(offset)
    );

    const rows = await db
      .with(pageCte)
      .select({
        match: matchTable,
        matchSummoner: matchSummonerTable,
      })
      .from(pageCte)
      .innerJoin(matchTable, eq(matchTable.matchId, pageCte.matchId))
      .innerJoin(
        matchSummonerTable,
        eq(matchSummonerTable.matchId, pageCte.matchId)
      )
      .orderBy(desc(matchTable.gameCreationMs), desc(matchTable.matchId));

    // group by match with a Map in O(n)
    const map = new Map<
      string,
      MatchRowType & { summoners: MatchSummonerRowType[] }
    >();
    for (const { match, matchSummoner } of rows) {
      const g = map.get(match.matchId);
      if (!g) {
        map.set(match.matchId, { ...match, summoners: [matchSummoner] });
      } else {
        g.summoners.push(matchSummoner);
      }
    }

    const data = Array.from(map.values());

    return {
      data,
      next_page: data.length === filters.limit ? filters.page + 1 : null,
    };
  }

  static async getMatchesDBCountByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    params: Pick<OutputPagedMatchIDsQueryParams, "queue">
  ) {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(matchTable)
      .where(
        and(
          ilike(matchTable.matchId, `${id.region}_%`),
          params.queue ? eq(matchTable.queueId, params.queue) : sql`true`,
          exists(
            db
              .select({ one: sql`1` })
              .from(matchSummonerTable)
              .where(
                and(
                  eq(matchSummonerTable.matchId, matchTable.matchId),
                  eq(matchSummonerTable.puuid, id.puuid)
                )
              )
          )
        )
      );

    return result[0]?.count ?? 0;
  }

  private static readonly MIN_START_TIME = 1736380801;

  public static async _getAllMatcheIdsDTOByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"],
    startTimeEpoch?: number
  ) {
    const ids: MatchRowType["matchId"][] = [];

    const _params: OutputPagedMatchIDsQueryParams = {
      start: 0,
      count: 100,
      queue: queueId,
      startTime: startTimeEpoch,
    };

    let nextStart: number | null = _params.start;
    const maxLoopCount = process.env.NODE_ENV === "development" ? 1000 : 1;
    let currentLoopCount = 0;

    do {
      if (currentLoopCount >= maxLoopCount) break;

      _params.start = nextStart;

      const data = await this.getMatchIdsDTOByPuuidPaged(id, _params);

      nextStart = data.next_start;

      ids.push(...data.ids);
      currentLoopCount++;
    } while (nextStart !== null);

    return ids;
  }

  public static async saveMatchesDTOtoDBTx(
    tx: TransactionType,
    matches: MatchDTOType[]
  ): Promise<MatchWithSummonersType[]> {
    if (matches.length === 0) return [];

    const BATCH = 100;

    const dbData = matches.map((m) => this.matchDTOtoDB(m));
    const dbMatches: MatchRowType[] = dbData.flatMap(({ match }) => match);
    const dbSummoners: MatchSummonerRowType[] = dbData.flatMap(
      ({ summoners }) => summoners
    );

    for (let i = 0; i < dbMatches.length; i += BATCH) {
      const chunk = dbMatches.slice(i, i + BATCH);
      await tx.insert(matchTable).values(chunk);
    }

    for (let i = 0; i < dbSummoners.length; i += BATCH) {
      const chunk = dbSummoners.slice(i, i + BATCH);
      await tx.insert(matchSummonerTable).values(chunk);
    }

    const dbSummonersByMatchId = Object.groupBy(dbSummoners, (o) => o.matchId);

    return dbData.map((m) => {
      return {
        ...m.match,
        summoners: dbSummonersByMatchId[m.match.matchId]!,
      };
    });
  }

  public static async getAllMatchesDTOByPuuidTx(
    tx: TransactionType,
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"]
  ) {
    const ids = await this._getAllMatcheIdsDTOByPuuid(id, queueId);

    const alreadySavedMatches = await this.getMatchesDBByMatchIds(ids);
    const notSavedMatchIds = ids.filter(
      (id) => !alreadySavedMatches.some((m) => m.matchId === id)
    );

    const newMatches = await Promise.all(
      notSavedMatchIds.map((id) => this.getMatchDTOById(id))
    );

    await this.saveMatchesDTOtoDBTx(tx, newMatches);
  }

  public static async getAndSaveMatcheIdsTx(
    tx: TransactionType,
    ids: MatchRowType["matchId"][]
  ) {
    const uniqueIds = Array.from(new Set(ids));

    const alreadySaved = await MatchService.getMatchesDBByMatchIds(uniqueIds);
    const notSavedIds = uniqueIds.filter(
      (mid) => !alreadySaved.some((m) => m.matchId === mid)
    );

    const batchSize = 50;
    const totalBatches = Math.ceil(notSavedIds.length / batchSize);
    const newlySaved: MatchWithSummonersType[] = [];

    for (let b = 0; b < totalBatches; b++) {
      const start = b * batchSize;
      const end = Math.min(notSavedIds.length, start + batchSize);
      const slice = notSavedIds.slice(start, end);

      if (slice.length === 0) continue;

      const dtos = await Promise.all(
        slice.map((mid) => MatchService.getMatchDTOById(mid, false))
      );

      if (dtos.length === 0) continue;

      const savedBatch = await MatchService.saveMatchesDTOtoDBTx(tx, dtos);

      newlySaved.push(...savedBatch);
    }

    return [...alreadySaved, ...newlySaved];
  }

  public static async assertSummonerWasInMatch(
    puuid: SummonerType["puuid"],
    matchId: MatchRowType["matchId"]
  ) {
    const data = await db.query.matchSummonerTable.findFirst({
      where: and(
        eq(matchSummonerTable.puuid, puuid),
        eq(matchSummonerTable.matchId, matchId)
      ),
    });

    if (!data) {
      throw new Error("Summoner was not in the match.");
    }
  }

  public static async batchGetMatchesPagedTx(
    tx: TransactionType,
    summoners: Pick<SummonerType, "puuid" | "region">[],
    _filters: InputPagedMatchIDsQueryParams
  ) {
    const filters: OutputPagedMatchIDsQueryParams = {
      count: 10,
      start: 0,
      ..._filters,
    };

    const matchIdsData = await Promise.all(
      summoners.map(async (s) => {
        const ids = await MatchService.getMatchIdsDTOByPuuidPaged(
          { region: s.region, puuid: s.puuid },
          filters
        );

        return {
          puuid: s.puuid,
          matchIds: ids,
        };
      })
    );

    const matches = await MatchService.getAndSaveMatcheIdsTx(
      tx,
      matchIdsData.flatMap((m) => m.matchIds.ids)
    );

    return summoners.reduce((acc, s) => {
      const matchIds = matchIdsData.find((m) => m.puuid === s.puuid)!.matchIds
        .ids;
      const summonerMatches = matches.filter((m) =>
        matchIds.includes(m.matchId)
      );

      acc[s.puuid] = summonerMatches;

      return acc;
    }, {} as Record<SummonerType["puuid"], MatchWithSummonersType[]>);
  }
}
