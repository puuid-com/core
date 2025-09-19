DROP INDEX "uq_le_puuid_queue_latest";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_le_puuid_queue_latest" ON "league" USING btree ("puuid","queue_type") WHERE "league"."is_latest" is true;