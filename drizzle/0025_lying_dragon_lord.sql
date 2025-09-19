CREATE TABLE "user_page_summoner" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_page_id" uuid NOT NULL,
	"puuid" text NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "summoner" DROP CONSTRAINT "summoner_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "user_page_summoner" ADD CONSTRAINT "user_page_summoner_user_page_id_user_page_id_fk" FOREIGN KEY ("user_page_id") REFERENCES "public"."user_page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "summoner" DROP COLUMN "is_main";