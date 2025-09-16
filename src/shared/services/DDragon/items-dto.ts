import * as v from "valibot";

/** Common sub-schemas */
export const DDragonImageSchema = v.object({
  full: v.string(),
  sprite: v.string(),
  group: v.string(),
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
});

export const DDragonGoldSchema = v.object({
  base: v.number(),
  purchasable: v.boolean(),
  total: v.number(),
  sell: v.number(),
});

/** Flexible maps and stats, keys are dynamic like "11" or "FlatHPPoolMod" */
export const DDragonMapsSchema = v.record(v.string(), v.boolean());
export const DDragonStatsSchema = v.record(v.string(), v.number());

/** Effect values are strings in DDragon, eg "Effect1Amount": "8" */
export const DDragonEffectSchema = v.record(v.string(), v.string());

/** Single item entry found under data["<itemId>"] */
export const DDragonItemSchema = v.object({
  name: v.string(),
  description: v.string(),
  colloq: v.optional(v.string()),
  plaintext: v.optional(v.string()),

  /** build paths */
  into: v.optional(v.array(v.string())),
  from: v.optional(v.array(v.string())),

  image: DDragonImageSchema,
  gold: DDragonGoldSchema,

  /** classification and availability */
  tags: v.array(v.string()),
  maps: DDragonMapsSchema,

  /** numbers can be empty object when no stats */
  stats: v.optional(DDragonStatsSchema),

  /** optional, present for items with scripted effects */
  effect: v.optional(DDragonEffectSchema),

  /** assorted optional flags and metadata */
  depth: v.optional(v.number()),
  stacks: v.optional(v.number()),
  consumed: v.optional(v.boolean()),
  inStore: v.optional(v.boolean()),
  consumeOnFull: v.optional(v.boolean()),
  specialRecipe: v.optional(v.number()),
  hideFromAll: v.optional(v.boolean()),
  requiredChampion: v.optional(v.string()),
  requiredAlly: v.optional(v.string()),
  requiredBuffCurrencyName: v.optional(v.string()),
  requiredBuffCurrencyCost: v.optional(v.number()),
  charges: v.optional(v.number()),
  group: v.optional(v.string()),
});

/** The "basic" template in item.json uses the same shape but is very sparse */
export const DDragonBasicItemSchema = v.partial(
  v.object({
    name: v.string(),
    description: v.string(),
    colloq: v.string(),
    plaintext: v.string(),
    into: v.array(v.string()),
    from: v.array(v.string()),
    image: DDragonImageSchema,
    gold: DDragonGoldSchema,
    tags: v.array(v.string()),
    maps: DDragonMapsSchema,
    stats: DDragonStatsSchema,
    effect: DDragonEffectSchema,
    depth: v.number(),
    stacks: v.number(),
    consumed: v.boolean(),
    inStore: v.boolean(),
    consumeOnFull: v.boolean(),
    specialRecipe: v.number(),
    hideFromAll: v.boolean(),
    requiredChampion: v.string(),
    requiredAlly: v.string(),
    requiredBuffCurrencyName: v.string(),
    requiredBuffCurrencyCost: v.number(),
    charges: v.number(),
    group: v.string(),
    rune: v.object({
      isrune: v.boolean(),
      tier: v.number(),
    }),
  }),
);

/** Optional groups and tree sections at the root */
export const DDragonItemGroupSchema = v.object({
  id: v.string(),
  MaxGroupOwnable: v.number(),
});

export const DDragonItemTreeSchema = v.object({
  header: v.string(),
  tags: v.array(v.string()),
});

/** Top level file schema for item.json */
export const DDragonItemFileSchema = v.pipe(
  v.object({
    // type: v.string(), // usually "item"
    // version: v.string(), // eg "15.16.1"
    // basic: DDragonBasicItemSchema,
    data: v.record(v.string(), DDragonItemSchema),
    // groups: v.optional(v.array(DDragonItemGroupSchema)),
    // tree: v.optional(v.array(DDragonItemTreeSchema)),
  }),
  v.transform((data) => {
    return data.data;
  }),
);

export type DDragonItemsData = v.InferOutput<typeof DDragonItemFileSchema>;
export type DDragonItemType = v.InferOutput<typeof DDragonItemSchema>;
