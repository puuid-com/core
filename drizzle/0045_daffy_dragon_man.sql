ALTER TABLE "summoner_statistic" DROP CONSTRAINT "summoner_statistic_latest_league_entry_id_league_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'summoner_refresh'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

ALTER TABLE "summoner_refresh" DROP CONSTRAINT "summoner_refresh_pkey";--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD COLUMN "id" uuid PRIMARY KEY NOT NULL;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD COLUMN "latest_league_entry_id" uuid;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD COLUMN "summoner_statistic_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD COLUMN "recent_summoner_statistic_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD CONSTRAINT "summoner_refresh_latest_league_entry_id_league_id_fk" FOREIGN KEY ("latest_league_entry_id") REFERENCES "public"."league"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD CONSTRAINT "summoner_refresh_summoner_statistic_id_summoner_statistic_id_fk" FOREIGN KEY ("summoner_statistic_id") REFERENCES "public"."summoner_statistic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD CONSTRAINT "summoner_refresh_recent_summoner_statistic_id_summoner_statistic_id_fk" FOREIGN KEY ("recent_summoner_statistic_id") REFERENCES "public"."summoner_statistic"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP COLUMN "queue_type";--> statement-breakpoint
ALTER TABLE "summoner_statistic" DROP COLUMN "latest_league_entry_id";