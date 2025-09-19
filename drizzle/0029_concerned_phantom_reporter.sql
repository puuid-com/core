CREATE TABLE "user_page_statistic" (
	"user_page_id" uuid NOT NULL,
	"queue_type" text NOT NULL,
	"main_position" text,
	"main_champion_id" integer NOT NULL,
	"main_champion_skin_id" integer DEFAULT 0 NOT NULL,
	"main_champion_background_color" text,
	"main_champion_foreground_color" text,
	"kills" integer NOT NULL,
	"assists" integer NOT NULL,
	"deaths" integer NOT NULL,
	"average_kda" double precision NOT NULL,
	"average_kill_per_game" double precision NOT NULL,
	"average_death_per_game" double precision NOT NULL,
	"average_assist_per_game" double precision NOT NULL,
	"stats_by_teammates" jsonb NOT NULL,
	"stats_by_champion_id" jsonb NOT NULL,
	"stats_by_position" jsonb NOT NULL,
	"stats_by_opposite_position_champion_id" jsonb NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_page_statistic_user_page_id_queue_type_pk" PRIMARY KEY("user_page_id","queue_type")
);
--> statement-breakpoint
ALTER TABLE "user_page" RENAME COLUMN "profile_image" TO "profile_image_url";--> statement-breakpoint
DROP INDEX "uq_name";--> statement-breakpoint
ALTER TABLE "user_page_statistic" ADD CONSTRAINT "user_page_statistic_user_page_id_user_page_id_fk" FOREIGN KEY ("user_page_id") REFERENCES "public"."user_page"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_name" ON "user_page" USING btree ("normalized_name","display_name") WHERE "user_page"."is_public" = true;