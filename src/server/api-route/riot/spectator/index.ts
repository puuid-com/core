export * from "./SpectatorRoutes";

export {
  ActiveGameResponseSchema,
  BannedChampionDTOSchema as ActiveGameBannedChampionDTOSchema,
  CurrentGameInfoDTOSchema,
  CurrentGameParticipantDTOSchema,
  GameCustomizationObjectDTOSchema,
  ObserverDTOSchema as ActiveGameObserverDTOSchema,
  PerksDTOSchema,
} from "./ActiveGameDTO";

export type {
  BannedChampionDTOType as ActiveGameBannedChampionDTOType,
  CurrentGameInfoDTOType,
  CurrentGameParticipantDTOType,
  GameCustomizationObjectDTOType,
  ObserverDTOType as ActiveGameObserverDTOType,
  PerksDTOType,
} from "./ActiveGameDTO";

export {
  BannedChampionDTOSchema as FeaturedGamesBannedChampionDTOSchema,
  FeaturedGameInfoDTOSchema,
  FeaturedGamesDTOSchema,
  ObserverDTOSchema as FeaturedGamesObserverDTOSchema,
  ParticipantDTOSchema as FeaturedGamesParticipantDTOSchema,
} from "./FeaturedGamesDTO";

export type {
  BannedChampionDTOType as FeaturedGamesBannedChampionDTOType,
  FeaturedGameInfoDTOType,
  FeaturedGamesDTOType,
  ObserverDTOType as FeaturedGamesObserverDTOType,
  ParticipantDTOType as FeaturedGamesParticipantDTOType,
} from "./FeaturedGamesDTO";
