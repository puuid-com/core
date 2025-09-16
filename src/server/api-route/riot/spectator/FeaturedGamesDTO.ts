import * as v from "valibot";

/** Team ID, documented teams are 100 and 200 */
const TeamIdSchema = v.union([v.literal(100), v.literal(200)]);

/** BannedChampion
 *  pickTurn, The turn during which the champion was banned
 *  championId, The ID of the banned champion, may be -1 sentinel in some payloads
 *  teamId, The ID of the team that banned the champion
 */
const BannedChampionDTOSchema = v.object({
  pickTurn: v.number(),
  championId: v.number(), // allows -1 when present in payloads
  teamId: TeamIdSchema,
});

/** Observer
 *  encryptionKey, Key used to decrypt the spectator grid game data for playback
 */
const ObserverDTOSchema = v.object({
  encryptionKey: v.string(),
});

/** Participant
 *  bot, Flag indicating whether or not this participant is a bot
 *  spell2Id, The ID of the second summoner spell used by this participant
 *  profileIconId, The ID of the profile icon used by this participant
 *  puuid, Encrypted puuid of this participant
 *  championId, The ID of the champion played by this participant
 *  teamId, The team ID of this participant indicating the participant team
 *  spell1Id, The ID of the first summoner spell used by this participant
 *  riotId, Optional, present in some payloads although not listed in docs
 */
const ParticipantDTOSchema = v.object({
  bot: v.boolean(),
  spell2Id: v.number(),
  profileIconId: v.number(),
  puuid: v.string(),
  championId: v.number(),
  teamId: TeamIdSchema,
  spell1Id: v.number(),
  riotId: v.optional(v.string()),
});

/** FeaturedGameInfo
 *  gameMode, The game mode
 *  gameLength, The amount of time in seconds that has passed since the game started
 *  mapId, The ID of the map
 *  gameType, The game type
 *  bannedChampions, Banned champion information
 *  gameId, The ID of the game
 *  observers, The observer information
 *  gameQueueConfigId, The queue type, see Game Constants
 *  participants, The participant information
 *  platformId, The ID of the platform on which the game is being played
 */
const FeaturedGameInfoDTOSchema = v.object({
  gameMode: v.string(),
  gameLength: v.number(),
  mapId: v.number(),
  gameType: v.string(),
  bannedChampions: v.array(BannedChampionDTOSchema),
  gameId: v.number(),
  observers: ObserverDTOSchema,
  gameQueueConfigId: v.number(),
  participants: v.array(ParticipantDTOSchema),
  platformId: v.string(),
});

/** FeaturedGames
 *  gameList, The list of featured games
 */
const FeaturedGamesDTOSchema = v.object({
  gameList: v.array(FeaturedGameInfoDTOSchema),
});

/** Types inferred from schemas */
type BannedChampionDTOType = v.InferOutput<typeof BannedChampionDTOSchema>;
type ObserverDTOType = v.InferOutput<typeof ObserverDTOSchema>;
type ParticipantDTOType = v.InferOutput<typeof ParticipantDTOSchema>;
type FeaturedGameInfoDTOType = v.InferOutput<typeof FeaturedGameInfoDTOSchema>;
type FeaturedGamesDTOType = v.InferOutput<typeof FeaturedGamesDTOSchema>;

/** Exports */
export {
  BannedChampionDTOSchema,
  ObserverDTOSchema,
  ParticipantDTOSchema,
  FeaturedGameInfoDTOSchema,
  FeaturedGamesDTOSchema,
};

export type {
  BannedChampionDTOType,
  ObserverDTOType,
  ParticipantDTOType,
  FeaturedGameInfoDTOType,
  FeaturedGamesDTOType,
};
