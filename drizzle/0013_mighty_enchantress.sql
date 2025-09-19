ALTER TABLE "match_summoner" RENAME TO "match-summoner";--> statement-breakpoint
ALTER TABLE "summoner_refresh" RENAME TO "summoner-refresh";--> statement-breakpoint
ALTER TABLE "match-summoner" DROP CONSTRAINT "match_summoner_match_id_match_match_id_fk";
--> statement-breakpoint
ALTER TABLE "summoner-refresh" DROP CONSTRAINT "summoner_refresh_puuid_summoner_puuid_fk";
--> statement-breakpoint
ALTER TABLE "match-summoner" ADD CONSTRAINT "match-summoner_match_id_match_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner-refresh" ADD CONSTRAINT "summoner-refresh_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;