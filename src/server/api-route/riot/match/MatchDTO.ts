import * as v from "valibot";

const StatPerksSchema = v.object({
  defense: v.number(),
  flex: v.number(),
  offense: v.number(),
});

const PerkSelectionSchema = v.object({
  perk: v.number(),
  var1: v.number(),
  var2: v.number(),
  var3: v.number(),
});

const PerkStyleSchema = v.object({
  description: v.string(),
  selections: v.array(PerkSelectionSchema),
  style: v.number(),
});

const PerksSchema = v.object({
  statPerks: StatPerksSchema,
  styles: v.array(PerkStyleSchema),
});

export const LolPositions = ["BOTTOM", "JUNGLE", "MIDDLE", "TOP", "UTILITY", ""] as const;
export type LolPositionType = (typeof LolPositions)[number];

export const ParticipantDTOSchema = v.object({
  assists: v.number(),
  baronKills: v.number(),
  basicPings: v.number(),
  championId: v.number(),
  championName: v.string(),
  champLevel: v.number(),

  teamEarlySurrendered: v.boolean(),

  damageDealtToBuildings: v.number(),
  damageDealtToObjectives: v.number(),
  damageDealtToTurrets: v.number(),
  damageSelfMitigated: v.number(),

  deaths: v.number(),

  doubleKills: v.number(),
  dragonKills: v.number(),
  goldEarned: v.number(),
  goldSpent: v.number(),
  inhibitorKills: v.number(),
  item0: v.number(),
  item1: v.number(),
  item2: v.number(),
  item3: v.number(),
  item4: v.number(),
  item5: v.number(),
  item6: v.number(),
  killingSprees: v.number(),
  kills: v.number(),
  lane: v.string(),
  largestCriticalStrike: v.number(),
  magicDamageDealtToChampions: v.number(),
  neutralMinionsKilled: v.number(),
  participantId: v.number(),
  pentaKills: v.number(),
  perks: PerksSchema,
  physicalDamageDealt: v.number(),
  physicalDamageDealtToChampions: v.number(),
  physicalDamageTaken: v.number(),
  placement: v.number(),
  playerSubteamId: v.number(),
  profileIcon: v.number(),
  puuid: v.string(),
  quadraKills: v.number(),
  riotIdGameName: v.string(),
  riotIdTagline: v.string(),
  summoner1Id: v.number(),
  summoner2Id: v.number(),
  summonerLevel: v.number(),
  teamId: v.number(),
  teamPosition: v.picklist(LolPositions),
  totalAllyJungleMinionsKilled: v.number(),
  totalDamageDealtToChampions: v.number(),
  totalDamageTaken: v.number(),
  totalMinionsKilled: v.number(),
  tripleKills: v.number(),
  turretKills: v.number(),
  unrealKills: v.number(),
  visionScore: v.number(),
  wardsKilled: v.number(),
  win: v.boolean(),
});
export type MatchParticipantDTOType = v.InferOutput<typeof ParticipantDTOSchema>;

const BanSchema = v.object({
  championId: v.number(),
  pickTurn: v.number(),
});

const TeamSchema = v.object({
  bans: v.array(BanSchema),
  teamId: v.number(),
  win: v.boolean(),
});

const MetadataSchema = v.object({
  dataVersion: v.string(),
  matchId: v.string(),
  participants: v.array(v.string()),
});

const InfoSchema = v.object({
  gameCreation: v.number(),
  gameDuration: v.number(),
  gameEndTimestamp: v.number(),
  gameId: v.number(),
  gameMode: v.string(),
  gameName: v.string(),
  gameStartTimestamp: v.number(),
  gameType: v.string(),
  gameVersion: v.string(),
  mapId: v.number(),
  participants: v.array(ParticipantDTOSchema),
  platformId: v.string(),
  queueId: v.number(),
  teams: v.array(TeamSchema),
  tournamentCode: v.string(),
});

export const MatchDTOSchema = v.object({
  metadata: MetadataSchema,
  info: InfoSchema,
});

export type MatchDTOType = v.InferInput<typeof MatchDTOSchema>;
