export const trimRiotID = (riotID: string) => {
  return riotID.replaceAll(" ", "").replace("-", "#").toUpperCase();
};

export const normalizeRiotID = (riotID: string) => {
  return trimRiotID(riotID)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
};

export const normalizeString = (str: string) => {
  return str
    .replaceAll(" ", "")
    .toUpperCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
};
