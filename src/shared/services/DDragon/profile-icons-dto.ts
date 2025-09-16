import * as v from "valibot";

export const ProfileIconImageSchema = v.object({
  full: v.string(),
  sprite: v.string(),
  group: v.string(),
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
});

export const ProfileIconEntrySchema = v.object({
  id: v.number(),
  image: ProfileIconImageSchema,
});

export const ProfileIconSchema = v.object({
  type: v.string(),
  version: v.string(),
  data: v.record(v.string(), ProfileIconEntrySchema),
});

export type ProfileIconImageType = v.InferOutput<typeof ProfileIconImageSchema>;
export type ProfileIconEntryType = v.InferOutput<typeof ProfileIconEntrySchema>;
export type ProfileIconType = v.InferOutput<typeof ProfileIconSchema>;
