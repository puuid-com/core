ALTER TABLE "league_entry" RENAME TO "league";--> statement-breakpoint
ALTER TABLE "league" DROP CONSTRAINT "league_entry_puuid_summoner_puuid_fk";
--> statement-breakpoint
ALTER TABLE "statistic" DROP CONSTRAINT "statistic_latest_league_entry_id_league_entry_id_fk";
--> statement-breakpoint
ALTER TABLE "league" ADD CONSTRAINT "league_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_latest_league_entry_id_league_id_fk" FOREIGN KEY ("latest_league_entry_id") REFERENCES "public"."league"("id") ON DELETE set null ON UPDATE no action;