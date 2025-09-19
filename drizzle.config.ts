import { serverEnv } from "@/server/lib/env/server";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/server/db/schema"],
  dialect: "postgresql",
  dbCredentials: {
    host: serverEnv.DATABASE_HOST,
    port: serverEnv.DATABASE_PORT,
    database: serverEnv.DATABASE_NAME,
    user: serverEnv.DATABASE_USER,
    password: serverEnv.DATABASE_PASSWORD,
    ssl: { ca: Buffer.from(serverEnv.DATABASE_CRT, "base64").toString("utf8") }, // vérification activée
  },
});
