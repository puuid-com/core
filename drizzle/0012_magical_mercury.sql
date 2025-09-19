ALTER TABLE "match_summoner" RENAME COLUMN "individual_position" TO "position";--> statement-breakpoint
ALTER TABLE "summoner-statistic" RENAME COLUMN "main_individual_position" TO "main_position";--> statement-breakpoint
ALTER TABLE "summoner-statistic" RENAME COLUMN "stats_by_individual_position" TO "stats_by_position";--> statement-breakpoint
ALTER TABLE "summoner-statistic" RENAME COLUMN "stats_by_opposite_individual_position_champion_id" TO "stats_by_opposite_position_champion_id";--> statement-breakpoint
ALTER TABLE "match-comment" ALTER COLUMN "user_id" SET DATA TYPE text;