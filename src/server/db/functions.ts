export const ensureSummonerOwnership = (puuid: string, verifiedPuuids: string[]) => {
  if (!verifiedPuuids.includes(puuid)) {
    throw new Error("Unauthorized");
  }
};
