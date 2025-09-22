CREATE TABLE "champion" (
	"key" integer NOT NULL,
	"id" text NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "champion_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "league" DROP CONSTRAINT "league_puuid_summoner_puuid_fk";
--> statement-breakpoint
ALTER TABLE "league" ADD COLUMN "created_day" date;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_le_puuid_queue_day" ON "league" USING btree ("puuid","queue_type","created_day");