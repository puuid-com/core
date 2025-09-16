import { normalizeRiotID, trimRiotID } from "@/lib/riotID";

export const getPartsFromRiotID = (riotID: string) => {
  const [gameName, tagLine] = riotID.split("#");

  if (!gameName || !tagLine) {
    throw new Error("Invalid Summoner Name : " + trimRiotID);
  }

  return {
    nornalizedRiotId: normalizeRiotID(riotID),
    riotId: trimRiotID(riotID),
    gameName,
    tagLine,
  };
};
