import * as v from "valibot";

export const ImageSchema = v.object({
  full: v.string(),
  sprite: v.string(),
  group: v.string(),
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
});

export type ImageType = v.InferOutput<typeof ImageSchema>;

export const SkinSchema = v.object({
  id: v.string(),
  num: v.number(),
  name: v.string(),
  chromas: v.boolean(),
});
export type SkinType = v.InferOutput<typeof SkinSchema>;

const LevelTipSchema = v.object({
  label: v.array(v.string()),
  effect: v.array(v.string()),
});

const SpellImageSchema = ImageSchema;

const SpellVarsSchema = v.object({
  key: v.string(),
  link: v.optional(v.string()),
  coeff: v.union([v.number(), v.array(v.number())]),
});

const SpellSchema = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  tooltip: v.string(),
  leveltip: LevelTipSchema,
  maxrank: v.number(),
  cooldown: v.array(v.number()),
  cooldownBurn: v.string(),
  cost: v.array(v.number()),
  costBurn: v.string(),
  datavalues: v.object({}),
  effect: v.array(v.union([v.null(), v.array(v.number())])),
  effectBurn: v.array(v.union([v.null(), v.string()])),
  vars: v.array(SpellVarsSchema),
  costType: v.string(),
  maxammo: v.string(),
  range: v.array(v.number()),
  rangeBurn: v.string(),
  image: SpellImageSchema,
  resource: v.string(),
});

const PassiveSchema = v.object({
  name: v.string(),
  description: v.string(),
  image: ImageSchema,
});

const InfoSchema = v.object({
  attack: v.number(),
  defense: v.number(),
  magic: v.number(),
  difficulty: v.number(),
});

const StatsSchema = v.object({
  hp: v.number(),
  hpperlevel: v.number(),
  mp: v.number(),
  mpperlevel: v.number(),
  movespeed: v.number(),
  armor: v.number(),
  armorperlevel: v.number(),
  spellblock: v.number(),
  spellblockperlevel: v.number(),
  attackrange: v.number(),
  hpregen: v.number(),
  hpregenperlevel: v.number(),
  mpregen: v.number(),
  mpregenperlevel: v.number(),
  crit: v.number(),
  critperlevel: v.number(),
  attackdamage: v.number(),
  attackdamageperlevel: v.number(),
  attackspeedperlevel: v.number(),
  attackspeed: v.number(),
});

// ---------- Champion and file schemas

export const ChampionSchema = v.object({
  id: v.string(), // e.g. "Aatrox"
  key: v.string(), // numeric id as string e.g. "266"
  name: v.string(),
  title: v.string(),
  image: ImageSchema,
  skins: v.array(SkinSchema),
  lore: v.string(),
  blurb: v.string(),
  allytips: v.array(v.string()),
  enemytips: v.array(v.string()),
  tags: v.array(v.string()),
  partype: v.string(),
  info: InfoSchema,
  stats: StatsSchema,
  spells: v.array(SpellSchema),
  passive: PassiveSchema,
  recommended: v.array(v.any()),
});

export type ChampionType = v.InferOutput<typeof ChampionSchema>;

export const DDragonChampionFileSchema = v.object({
  type: v.literal("champion"),
  format: v.literal("standAloneComplex"),
  version: v.string(),
  data: v.record(v.string(), ChampionSchema),
});

export type DDragonChampionFileType = v.InferOutput<typeof DDragonChampionFileSchema>;
