DROP INDEX "uq_le_puuid_queue_day";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_le_puuid_queue_latest" ON "league" USING btree ("puuid","queue_type","is_latest");