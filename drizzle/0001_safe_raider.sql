DROP INDEX "uq_le_puuid_queue_day";--> statement-breakpoint
ALTER TABLE "league_entry" ADD COLUMN "is_latest" boolean NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_le_puuid_queue_day" ON "league_entry" USING btree ("puuid","queue_type","is_latest");--> statement-breakpoint
ALTER TABLE "league_entry" DROP COLUMN "created_day";