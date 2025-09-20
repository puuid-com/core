import * as v from "valibot";

/** Team ID, documented teams are 100 and 200 */
const TeamIdSchema = v.union([v.literal(100), v.literal(200)]);

/** GameCustomizationObject
 *  category, Category identifier for Game Customization
 *  content, Game Customization content
 */
const GameCustomizationObjectDTOSchema = v.object({
  category: v.string(),
  content: v.string(),
});

/** Perks
 *  perkIds, IDs of the perks runes assigned
 *  perkStyle, Primary runes path
 *  perkSubStyle, Secondary runes path
 */
const PerksDTOSchema = v.object({
  perkIds: v.array(v.number()),
  perkStyle: v.number(),
  perkSubStyle: v.number(),
});

/** CurrentGameParticipant
 *  championId, The ID of the champion played by this participant
 *  perks, Perks Runes Reforged Information
 *  profileIconId, The ID of the profile icon used by this participant
 *  bot, Flag indicating whether or not this participant is a bot
 *  teamId, The team ID of this participant indicating the participant team
 *  puuid, The encrypted puuid of this participant
 *  spell1Id, The ID of the first summoner spell used by this participant
 *  spell2Id, The ID of the second summoner spell used by this participant
 *  gameCustomizationObjects, List of Game Customizations
 */
const CurrentGameParticipantDTOSchema = v.object({
  championId: v.number(),
  perks: PerksDTOSchema,
  profileIconId: v.number(),
  bot: v.boolean(),
  teamId: TeamIdSchema,
  puuid: v.string(),
  riotId: v.string(),
  spell1Id: v.number(),
  spell2Id: v.number(),
  gameCustomizationObjects: v.array(GameCustomizationObjectDTOSchema),
});

/** Observer
 *  encryptionKey, Key used to decrypt the spectator grid game data for playback
 */
const ObserverDTOSchema = v.object({
  encryptionKey: v.string(),
});

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

/** CurrentGameInfo
 *  gameId, The ID of the game
 *  gameType, The game type
 *  gameStartTime, The game start time represented in epoch milliseconds
 *  mapId, The ID of the map
 *  gameLength, The amount of time in seconds that has passed since the game started
 *  platformId, The ID of the platform on which the game is being played
 *  gameMode, The game mode
 *  bannedChampions, Banned champion information
 *  gameQueueConfigId, The queue type, see Game Constants
 *  observers, The observer information
 *  participants, The participant information
 */
const CurrentGameInfoDTOSchema = v.object({
  gameId: v.number(),
  gameType: v.string(),
  gameStartTime: v.number(),
  mapId: v.number(),
  gameLength: v.number(),
  platformId: v.string(),
  gameMode: v.string(),
  bannedChampions: v.array(BannedChampionDTOSchema),
  gameQueueConfigId: v.number(),
  observers: ObserverDTOSchema,
  participants: v.array(CurrentGameParticipantDTOSchema),
});

const NotInActiveGameSchema = v.object({
  httpStatus: v.literal(404),
});

const ActiveGameResponseSchema = v.union([CurrentGameInfoDTOSchema, NotInActiveGameSchema]);

/** Types inferred from schemas */
type GameCustomizationObjectDTOType = v.InferOutput<typeof GameCustomizationObjectDTOSchema>;
type PerksDTOType = v.InferOutput<typeof PerksDTOSchema>;
type CurrentGameParticipantDTOType = v.InferOutput<typeof CurrentGameParticipantDTOSchema>;
type ObserverDTOType = v.InferOutput<typeof ObserverDTOSchema>;
type BannedChampionDTOType = v.InferOutput<typeof BannedChampionDTOSchema>;
type CurrentGameInfoDTOType = v.InferOutput<typeof CurrentGameInfoDTOSchema>;

/** Exports */
export {
  GameCustomizationObjectDTOSchema,
  PerksDTOSchema,
  CurrentGameParticipantDTOSchema,
  ObserverDTOSchema,
  BannedChampionDTOSchema,
  CurrentGameInfoDTOSchema,
  ActiveGameResponseSchema,
};

export type {
  GameCustomizationObjectDTOType,
  PerksDTOType,
  CurrentGameParticipantDTOType,
  ObserverDTOType,
  BannedChampionDTOType,
  CurrentGameInfoDTOType,
};
