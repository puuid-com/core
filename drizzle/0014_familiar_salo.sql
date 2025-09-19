ALTER TABLE "match-comment" RENAME TO "match_comment";--> statement-breakpoint
ALTER TABLE "match-summoner" RENAME TO "match_summoner";--> statement-breakpoint
ALTER TABLE "summoner-refresh" RENAME TO "summoner_refresh";--> statement-breakpoint
ALTER TABLE "summoner-statistic" RENAME TO "summoner_statistic";--> statement-breakpoint
ALTER TABLE "match_comment" DROP CONSTRAINT "match-comment_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "match_comment" DROP CONSTRAINT "match-comment_puuid_summoner_puuid_fk";
--> statement-breakpoint
ALTER TABLE "match_comment" DROP CONSTRAINT "match-comment_match_id_match_match_id_fk";
--> statement-breakpoint
ALTER TABLE "match_summoner" DROP CONSTRAINT "match-summoner_match_id_match_match_id_fk";
--> statement-breakpoint
ALTER TABLE "summoner_refresh" DROP CONSTRAINT "summoner-refresh_puuid_summoner_puuid_fk";
--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP CONSTRAINT "summoner-statistic_puuid_summoner_puuid_fk";
--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP CONSTRAINT "summoner-statistic_latest_league_entry_id_league_id_fk";
--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP CONSTRAINT "summoner-statistic_puuid_queue_type_pk";--> statement-breakpoint
ALTER TABLE "summoner_statistic" ADD CONSTRAINT "summoner_statistic_puuid_queue_type_pk" PRIMARY KEY("puuid","queue_type");--> statement-breakpoint
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_match_id_match_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_summoner" ADD CONSTRAINT "match_summoner_match_id_match_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD CONSTRAINT "summoner_refresh_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner_statistic" ADD CONSTRAINT "summoner_statistic_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner_statistic" ADD CONSTRAINT "summoner_statistic_latest_league_entry_id_league_id_fk" FOREIGN KEY ("latest_league_entry_id") REFERENCES "public"."league"("id") ON DELETE set null ON UPDATE no action;