DROP INDEX "idx_ms_match_puuid";--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "game_creation_ms" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_ms_puuid_matchid_gameCreationMs" ON "match_summoner" USING btree ("puuid","match_id","game_creation_ms" desc);