ALTER TABLE "summoner_refresh" ALTER COLUMN "summoner_statistic_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ALTER COLUMN "recent_summoner_statistic_id" SET DATA TYPE uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_summoner_refresh_puuid_queue_type" ON "summoner_refresh" USING btree ("puuid","queue_type");