import * as v from "valibot";

export const MatchIDsQueryParamsSchema = v.object({
  queue: v.number(),
  type: v.optional(v.string()),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
  count: v.optional(v.number(), 9999),
  start: v.optional(v.number(), 0),
});

export type InputPagedMatchIDsQueryParams = v.InferInput<
  typeof MatchIDsQueryParamsSchema
>;
export type OutputPagedMatchIDsQueryParams = v.InferOutput<
  typeof MatchIDsQueryParamsSchema
>;
