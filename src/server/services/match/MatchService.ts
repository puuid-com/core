import type { MatchDTOType } from "@/server/api-route/riot/match/MatchDTO";
import {
  MatchTimelineV5ByID,
  MatchIdsV5ByPuuid,
  MatchV5ByID,
} from "@/server/api-route/riot/match/MatchRoutes";
import {
  MatchIDsQueryParamsSchema,
  type InputPagedMatchIDsQueryParams,
  type OutputPagedMatchIDsQueryParams,
} from "@/server/services/match/type";
import { routingValueFromRegion, type LolRegionType } from "@/server/types/riot/common";
import { and, desc, eq, exists, ilike, inArray, sql } from "drizzle-orm";
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

export class MatchService {
  private static riotMatchQueryParamsToCacheWhereConditions(
    summoner: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams,
    resultType?: MatchResultType,
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
    params: OutputPagedMatchIDsQueryParams,
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
      },
    );

    return {
      ids,
      next_start: ids.length === params.count ? params.start + params.count : null,
    };
  }

  static async getMatchTimelineDTOById(id: string) {
    return MatchTimelineV5ByID.call({
      routingValue: routingValueFromRegion(id.split("_")[0]!.toLowerCase() as LolRegionType),
      id,
    });
  }

  private static getRegionFromMatchId(id: string) {
    return id.split("_")[0]!.toLowerCase() as LolRegionType;
  }

  static async getMatchDTOById(id: string, checkCache = true): Promise<MatchDTOType> {
    return MatchV5ByID.call(
      {
        id: id,
        routingValue: routingValueFromRegion(this.getRegionFromMatchId(id)),
      },
      undefined,
      checkCache,
    );
  }

  private static matchDTOtoDB(matchDTO: MatchDTOType): {
    match: MatchRowType;
    summoners: MatchSummonerRowType[];
  } {
    /*
     * Not sure about the logic, can't really tell if the team actually FF or remake.
     */
    const isSurrender = matchDTO.info.participants.some((p) => p.teamEarlySurrendered);
    const isRemake = matchDTO.info.gameCreation <= 5 * 60;

    const match: MatchInsertType = {
      matchId: matchDTO.metadata.matchId,
      gameCreationMs: matchDTO.info.gameStartTimestamp,
      gameDurationSec: matchDTO.info.gameDuration,
      queueId: matchDTO.info.queueId,
      platformId: matchDTO.info.platformId,
      resultType: isSurrender || isRemake ? "SURRENDER" : "NORMAL",
    };

    const summoners: MatchSummonerRowType[] = matchDTO.info.participants.map((p) => {
      const position = p.teamPosition;
      const vsSummoner = matchDTO.info.participants.find(
        (s) => s.teamPosition === position && s.puuid !== p.puuid,
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
    });

    return {
      match,
      summoners,
    };
  }

  static async getMatchesDTOByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams,
  ) {
    const { ids, next_start } = await MatchService.getMatchIdsDTOByPuuidPaged(id, params);

    const matches = await Promise.all(ids.map((id) => this.getMatchDTOById(id)));

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
    params: InputPagedMatchIDsQueryParams,
  ) {
    const _param = v.parse(MatchIDsQueryParamsSchema, params);

    const conditions = this.riotMatchQueryParamsToCacheWhereConditions(id, _param);

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
    params: Pick<InputPagedMatchIDsQueryParams, "queue">,
  ) {
    const _param = v.parse(MatchIDsQueryParamsSchema, params);

    return db
      .select()
      .from(matchSummonerTable)
      .innerJoin(matchTable, eq(matchSummonerTable.matchId, matchTable.matchId))
      .innerJoin(summonerTable, eq(matchSummonerTable.puuid, summonerTable.puuid))
      .where(
        and(
          eq(summonerTable.riotId, id.riotId),
          eq(matchTable.queueId, _param.queue),
          eq(sql`lower(${matchTable.platformId})`, summonerTable.region),
        ),
      )
      .orderBy(desc(matchTable.gameCreationMs), desc(matchTable.matchId));
  }

  static async getMatchesDBByPuuidFull(
    id: Pick<SummonerType, "region" | "puuid">,
    params: InputPagedMatchIDsQueryParams,
    resultType?: MatchResultType,
  ) {
    const _param = v.parse(MatchIDsQueryParamsSchema, params);
    const conditions = this.riotMatchQueryParamsToCacheWhereConditions(id, _param, resultType);

    return db.query.matchTable.findMany({
      with: {
        // ne pas filtrer ici, on veut tous les summoners du match
        summoners: true,
      },
      where: (mt, { and, eq, exists, sql }) =>
        and(
          conditions,
          exists(
            db
              .select({ one: sql`1` })
              .from(matchSummonerTable)
              .where(
                and(
                  eq(matchSummonerTable.matchId, mt.matchId),
                  eq(matchSummonerTable.puuid, id.puuid),
                ),
              ),
          ),
        ),
      limit: params.count,
      offset: params.start,
      // optionnel, souvent utile
      orderBy: (mt, { desc }) => [desc(mt.gameCreationMs)],
    });
  }

  static async getMatchesDBCountByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    params: Pick<OutputPagedMatchIDsQueryParams, "queue">,
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
                  eq(matchSummonerTable.puuid, id.puuid),
                ),
              ),
          ),
        ),
      );

    return result[0]?.count ?? 0;
  }

  private static readonly MIN_START_TIME = 1736380801;

  public static async _getAllMatcheIdsDTOByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"],
    startTimeEpoch?: number,
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
    matches: MatchDTOType[],
  ): Promise<MatchWithSummonersType[]> {
    if (matches.length === 0) return [];

    const BATCH = 100;

    const dbData = matches.map((m) => this.matchDTOtoDB(m));
    const dbMatches: MatchRowType[] = dbData.flatMap(({ match }) => match);
    const dbSummoners: MatchSummonerRowType[] = dbData.flatMap(({ summoners }) => summoners);

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
    queueId: MatchRowType["queueId"],
  ) {
    const ids = await this._getAllMatcheIdsDTOByPuuid(id, queueId);

    const alreadySavedMatches = await this.getMatchesDBByMatchIds(ids);
    const notSavedMatchIds = ids.filter((id) => !alreadySavedMatches.some((m) => m.matchId === id));

    const newMatches = await Promise.all(notSavedMatchIds.map((id) => this.getMatchDTOById(id)));

    await this.saveMatchesDTOtoDBTx(tx, newMatches);
  }

  public static async getAndSaveMatcheIdsTx(tx: TransactionType, ids: MatchRowType["matchId"][]) {
    const uniqueIds = Array.from(new Set(ids));

    const alreadySaved = await MatchService.getMatchesDBByMatchIds(uniqueIds);
    const notSavedIds = uniqueIds.filter((mid) => !alreadySaved.some((m) => m.matchId === mid));

    const batchSize = 50;
    const totalBatches = Math.ceil(notSavedIds.length / batchSize);
    const newlySaved: MatchWithSummonersType[] = [];

    for (let b = 0; b < totalBatches; b++) {
      const start = b * batchSize;
      const end = Math.min(notSavedIds.length, start + batchSize);
      const slice = notSavedIds.slice(start, end);

      if (slice.length === 0) continue;

      const dtos = await Promise.all(slice.map((mid) => MatchService.getMatchDTOById(mid, false)));

      if (dtos.length === 0) continue;

      const savedBatch = await MatchService.saveMatchesDTOtoDBTx(tx, dtos);

      newlySaved.push(...savedBatch);
    }

    return [...alreadySaved, ...newlySaved];
  }

  public static async assertSummonerWasInMatch(
    puuid: SummonerType["puuid"],
    matchId: MatchRowType["matchId"],
  ) {
    const data = await db.query.matchSummonerTable.findFirst({
      where: and(eq(matchSummonerTable.puuid, puuid), eq(matchSummonerTable.matchId, matchId)),
    });

    if (!data) {
      throw new Error("Summoner was not in the match.");
    }
  }
}
