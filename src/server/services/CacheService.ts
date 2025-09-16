import { serverEnv } from "@/server/lib/env/server";
import { Client } from "minio";

export type CacheDir = "match" | "summoner-profile" | "match-timeline";

const r2 = new Client({
  endPoint: serverEnv.R2_END_POINT,
  port: 443,
  useSSL: true,
  accessKey: serverEnv.R2_ACCESS_KEY,
  secretKey: serverEnv.R2_SECRET_KEY,
});

const BUCKET = "riot-lol-match-cache";

export class CacheService {
  private static buildKey(id: string, dir?: CacheDir): string {
    if (!dir) return id;
    const sanitizedDir = dir.replace(/^\/+/, "").replace(/\/+$/, "");
    return `${sanitizedDir}/${id}`;
  }

  static async saveImageToCache(id: string, dataUrlOrBase64: string, dir: CacheDir) {
    // force l’extension .png
    const fileId = id.endsWith(".png") ? id : `${id}.png`;
    const objectKey = this.buildKey(fileId, dir);

    // accepte un Data URL ou du base64 brut
    const base64 = dataUrlOrBase64.startsWith("data:")
      ? dataUrlOrBase64.substring(dataUrlOrBase64.indexOf(",") + 1)
      : dataUrlOrBase64;

    const buffer = Buffer.from(base64, "base64");

    const putRes = await r2.putObject(BUCKET, objectKey, buffer, buffer.byteLength, {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=60, immutable",
    });

    return { etag: putRes.etag, key: objectKey };
  }

  static getImageURLFromCache(id: string, dir: CacheDir) {
    return `${serverEnv.R2_CDN_URL}/${this.buildKey(id, dir)}`;
  }

  static async saveToCache(id: string, data: unknown, dir: CacheDir) {
    const content = JSON.stringify(data);
    const buffer = Buffer.from(content, "utf-8");
    const objectKey = this.buildKey(id, dir);

    const cachedData = await r2.putObject(BUCKET, objectKey, buffer, buffer.byteLength, {
      "Content-Type": "application/json",
    });

    return cachedData;
  }

  static async tryGetFileFromCache<T>(id: string, dir: CacheDir) {
    const objectKey = this.buildKey(id, dir);
    let content;
    try {
      const stream = await r2.getObject(BUCKET, objectKey);

      const chunks: Uint8Array[] = [];

      for await (const chunk of stream) {
        chunks.push(chunk as Uint8Array);
      }

      content = Buffer.concat(chunks).toString("utf-8");
    } catch {
      console.error("Error getting file from cache:", { id, dir });
      return null;
    }

    try {
      return JSON.parse(content) as T;
    } catch {
      await this.deleteFileFromCache(id, dir);
      return null;
    }
  }

  static async deleteFileFromCache(id: string, dir: CacheDir) {
    const objectKey = this.buildKey(id, dir);
    try {
      await r2.removeObject(BUCKET, objectKey);
    } catch {
      return null;
    }
  }

  static async tryGetFilesFromCache<T>(ids: string[], dir: CacheDir) {
    const results = await Promise.all(
      ids.map(async (id) => CacheService.tryGetFileFromCache<T>(id, dir)),
    );

    return results.filter(Boolean) as T[];
  }
}
