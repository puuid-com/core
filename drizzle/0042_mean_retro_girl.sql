ALTER TABLE "summoner_statistic" ALTER COLUMN "main_champion_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "summoner" ADD COLUMN "main_champion_id" integer;--> statement-breakpoint
ALTER TABLE "summoner" ADD COLUMN "main_champion_skin_id" integer;--> statement-breakpoint
ALTER TABLE "summoner" ADD COLUMN "main_champion_background_color" text;--> statement-breakpoint
ALTER TABLE "summoner" ADD COLUMN "main_champion_foreground_color" text;--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP COLUMN "main_champion_skin_id";--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP COLUMN "main_champion_background_color";--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP COLUMN "main_champion_foreground_color";