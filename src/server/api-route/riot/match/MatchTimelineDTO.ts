import * as v from "valibot";

const PositionDTOSchema = v.object({
  x: v.number(),
  y: v.number(),
});

const ChampionStatsDTOSchema = v.object({
  abilityHaste: v.number(),
  abilityPower: v.number(),
  armor: v.number(),
  armorPen: v.number(),
  armorPenPercent: v.number(),
  attackDamage: v.number(),
  attackSpeed: v.number(),
  bonusArmorPenPercent: v.number(),
  bonusMagicPenPercent: v.number(),
  ccReduction: v.number(),
  cooldownReduction: v.number(),
  health: v.number(),
  healthMax: v.number(),
  healthRegen: v.number(),
  lifesteal: v.number(),
  magicPen: v.number(),
  magicPenPercent: v.number(),
  magicResist: v.number(),
  movementSpeed: v.number(),
  omnivamp: v.number(),
  physicalVamp: v.number(),
  power: v.number(),
  powerMax: v.number(),
  powerRegen: v.number(),
  spellVamp: v.number(),
});

const DamageStatsDTOSchema = v.object({
  magicDamageDone: v.number(),
  magicDamageDoneToChampions: v.number(),
  magicDamageTaken: v.number(),
  physicalDamageDone: v.number(),
  physicalDamageDoneToChampions: v.number(),
  physicalDamageTaken: v.number(),
  totalDamageDone: v.number(),
  totalDamageDoneToChampions: v.number(),
  totalDamageTaken: v.number(),
  trueDamageDone: v.number(),
  trueDamageDoneToChampions: v.number(),
  trueDamageTaken: v.number(),
});

const ParticipantFrameDTOSchema = v.object({
  championStats: ChampionStatsDTOSchema,
  currentGold: v.number(),
  damageStats: DamageStatsDTOSchema,
  goldPerSecond: v.number(),
  jungleMinionsKilled: v.number(),
  level: v.number(),
  minionsKilled: v.number(),
  participantId: v.number(),
  position: PositionDTOSchema,
  timeEnemySpentControlled: v.number(),
  totalGold: v.number(),
  xp: v.number(),
});

const WardTypeDTOSchema = v.union([
  v.literal("YELLOW_TRINKET"),
  v.literal("BLUE_TRINKET"),
  v.literal("CONTROL_WARD"),
  v.literal("SIGHT_WARD"),
  v.literal("UNDEFINED"),
]);

const DamageEntryDTOSchema = v.object({
  basic: v.optional(v.boolean()),
  magicDamage: v.number(),
  name: v.string(),
  participantId: v.optional(v.number()),
  physicalDamage: v.number(),
  spellName: v.string(),
  spellSlot: v.number(),
  trueDamage: v.number(),
  type: v.string(),
});

const PauseEndEventDTOSchema = v.object({
  type: v.literal("PAUSE_END"),
  timestamp: v.number(),
  realTimestamp: v.optional(v.number()),
});

const ItemStoreEventDTOSchema = v.object({
  type: v.union([v.literal("ITEM_PURCHASED"), v.literal("ITEM_SOLD")]),
  timestamp: v.number(),
  participantId: v.optional(v.number()),
  itemId: v.number(),
});

const ItemDestroyedEventDTOSchema = v.object({
  type: v.literal("ITEM_DESTROYED"),
  timestamp: v.number(),
  participantId: v.optional(v.number()),
  itemId: v.number(),
});

const ItemUndoEventDTOSchema = v.object({
  type: v.literal("ITEM_UNDO"),
  timestamp: v.number(),
  participantId: v.number(),
  beforeId: v.number(),
  afterId: v.number(),
  goldGain: v.number(),
});

const SkillLevelUpEventDTOSchema = v.object({
  type: v.literal("SKILL_LEVEL_UP"),
  timestamp: v.number(),
  participantId: v.number(),
  levelUpType: v.string(),
  skillSlot: v.number(),
});

const LevelUpEventDTOSchema = v.object({
  type: v.literal("LEVEL_UP"),
  timestamp: v.number(),
  participantId: v.number(),
  level: v.number(),
});

const WardPlacedEventDTOSchema = v.object({
  type: v.literal("WARD_PLACED"),
  timestamp: v.number(),
  creatorId: v.number(),
  wardType: WardTypeDTOSchema,
});

const WardKillEventDTOSchema = v.object({
  type: v.literal("WARD_KILL"),
  timestamp: v.number(),
  killerId: v.number(),
  wardType: WardTypeDTOSchema,
});

const ChampionKillEventDTOSchema = v.object({
  type: v.literal("CHAMPION_KILL"),
  timestamp: v.number(),
  killerId: v.number(),
  victimId: v.number(),
  bounty: v.optional(v.number()),
  killStreakLength: v.optional(v.number()),
  shutdownBounty: v.optional(v.number()),
  position: v.optional(PositionDTOSchema),
  assistingParticipantIds: v.optional(v.array(v.number())),
  victimDamageDealt: v.optional(v.array(DamageEntryDTOSchema)),
  victimDamageReceived: v.optional(v.array(DamageEntryDTOSchema)),
});

const TurretPlateDestroyedEventDTOSchema = v.object({
  type: v.literal("TURRET_PLATE_DESTROYED"),
  timestamp: v.number(),
  killerId: v.number(),
  teamId: v.number(),
  laneType: v.string(),
  position: PositionDTOSchema,
});

const BuildingKillEventDTOSchema = v.object({
  type: v.literal("BUILDING_KILL"),
  timestamp: v.number(),
  killerId: v.number(),
  teamId: v.number(),
  buildingType: v.string(),
  laneType: v.string(),
  towerType: v.optional(v.string()),
  position: PositionDTOSchema,
  assistingParticipantIds: v.optional(v.array(v.number())),
});

const EliteMonsterKillEventDTOSchema = v.object({
  type: v.literal("ELITE_MONSTER_KILL"),
  timestamp: v.number(),
  killerId: v.optional(v.number()),
  killerTeamId: v.optional(v.number()),
  monsterType: v.string(),
  monsterSubType: v.optional(v.string()),
  position: v.optional(PositionDTOSchema),
  assistingParticipantIds: v.optional(v.array(v.number())),
});

const SpecialKillTypeDTOSchema = v.union([
  v.literal("KILL_FIRST_BLOOD"),
  v.literal("KILL_MULTI"),
  v.string(),
]);

const ChampionSpecialKillEventDTOSchema = v.object({
  type: v.literal("CHAMPION_SPECIAL_KILL"),
  timestamp: v.number(),
  killerId: v.number(),
  position: PositionDTOSchema,
  killType: SpecialKillTypeDTOSchema,
  multiKillLength: v.optional(v.number()),
});

const FeatUpdateEventDTOSchema = v.object({
  type: v.literal("FEAT_UPDATE"),
  timestamp: v.number(),
  featType: v.number(),
  featValue: v.number(),
  teamId: v.number(),
});

// nouveaux events manquants dans ton dump
const DragonSoulGivenEventDTOSchema = v.object({
  type: v.literal("DRAGON_SOUL_GIVEN"),
  timestamp: v.number(),
  teamId: v.number(),
  name: v.string(),
}); // ex Ocean, teamId 0 :contentReference[oaicite:2]{index=2}

const ObjectiveBountyPrestartEventDTOSchema = v.object({
  type: v.literal("OBJECTIVE_BOUNTY_PRESTART"),
  timestamp: v.number(),
  teamId: v.number(),
  actualStartTime: v.number(),
}); // présent avec actualStartTime :contentReference[oaicite:3]{index=3}

const GameEndEventDTOSchema = v.object({
  type: v.literal("GAME_END"),
  timestamp: v.number(),
  realTimestamp: v.number(),
  gameId: v.number(),
  winningTeam: v.number(),
});

export const UnknownEventDTOSchema = v.object({
  type: v.string(),
  timestamp: v.number(),
  _isUnknown: v.exactOptional(v.boolean(), true),
});

const EventDTOSchema = v.union([
  PauseEndEventDTOSchema,
  ItemStoreEventDTOSchema,
  ItemDestroyedEventDTOSchema,
  ItemUndoEventDTOSchema,
  SkillLevelUpEventDTOSchema,
  LevelUpEventDTOSchema,
  WardPlacedEventDTOSchema,
  WardKillEventDTOSchema,
  ChampionKillEventDTOSchema,
  TurretPlateDestroyedEventDTOSchema,
  BuildingKillEventDTOSchema,
  EliteMonsterKillEventDTOSchema,
  ChampionSpecialKillEventDTOSchema,
  FeatUpdateEventDTOSchema,
  DragonSoulGivenEventDTOSchema,
  ObjectiveBountyPrestartEventDTOSchema,
  GameEndEventDTOSchema,
  UnknownEventDTOSchema,
]);

const FrameDTOSchema = v.object({
  events: v.array(EventDTOSchema),
  participantFrames: v.record(v.string(), ParticipantFrameDTOSchema),
  timestamp: v.number(),
});

const InfoDTOSchema = v.object({
  endOfGameResult: v.string(),
  frameInterval: v.number(),
  frames: v.array(FrameDTOSchema),
  gameId: v.optional(v.number()),
  participants: v.optional(
    v.array(
      v.object({
        participantId: v.number(),
        puuid: v.string(),
      }),
    ),
  ),
});

const MetadataDTOSchema = v.object({
  dataVersion: v.string(),
  matchId: v.string(),
  participants: v.array(v.string()),
});

export const MatchTimelineDTOSchema = v.object({
  metadata: MetadataDTOSchema,
  info: InfoDTOSchema,
});

// exports demandés
export type MatchTimelineEventEventDTOType = v.InferOutput<typeof EventDTOSchema>;
export type MatchTimelineDTOType = v.InferOutput<typeof MatchTimelineDTOSchema>;
