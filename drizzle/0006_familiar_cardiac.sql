ALTER TABLE "statistic" RENAME TO "summoner-statistic";--> statement-breakpoint
ALTER TABLE "summoner-statistic" DROP CONSTRAINT "statistic_puuid_summoner_puuid_fk";
--> statement-breakpoint
ALTER TABLE "summoner-statistic" DROP CONSTRAINT "statistic_latest_league_entry_id_league_id_fk";
--> statement-breakpoint
ALTER TABLE "summoner-statistic" DROP CONSTRAINT "statistic_puuid_queue_type_pk";--> statement-breakpoint
ALTER TABLE "summoner-statistic" ADD CONSTRAINT "summoner-statistic_puuid_queue_type_pk" PRIMARY KEY("puuid","queue_type");--> statement-breakpoint
ALTER TABLE "summoner-statistic" ADD CONSTRAINT "summoner-statistic_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner-statistic" ADD CONSTRAINT "summoner-statistic_latest_league_entry_id_league_id_fk" FOREIGN KEY ("latest_league_entry_id") REFERENCES "public"."league"("id") ON DELETE set null ON UPDATE no action;