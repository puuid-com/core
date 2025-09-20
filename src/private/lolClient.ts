import { serverEnv } from "@/server/lib/env/server";
import ky from "ky";

export const lolClient = ky.create({
  retry: {
    limit: 2, // ajuste à 0 si tu veux zéro retry même réseau
    statusCodes: [], // vide, donc aucun retry déclenché par un code HTTP
  },

  timeout: 30_000,

  searchParams: {
    api_key: serverEnv.RIOT_API_KEY,
  },
  hooks: {
    beforeRetry: [
      async ({ error, retryCount, request }) => {
        // appelé uniquement pour des erreurs réseau, jamais pour 4xx ou 5xx
        const url = request.url;
        const wait = Math.min(250 * 2 ** retryCount, 1_000);
        console.warn(`network retry ${retryCount + 1} on ${url}`, error);
        await new Promise((r) => setTimeout(r, wait));
      },
    ],
  },
});
