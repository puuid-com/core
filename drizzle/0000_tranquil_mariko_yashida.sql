CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "folowing" (
	"puuid" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league_entry" (
	"id" uuid PRIMARY KEY NOT NULL,
	"region" text NOT NULL,
	"league_id" text NOT NULL,
	"puuid" text NOT NULL,
	"queue_type" text NOT NULL,
	"tier" text NOT NULL,
	"rank" text,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_day" date GENERATED ALWAYS AS (((created_at at time zone 'UTC')::date)) STORED
);
--> statement-breakpoint
CREATE TABLE "match_summoner" (
	"match_id" text NOT NULL,
	"puuid" text NOT NULL,
	"game_name" text NOT NULL,
	"tag_line" text NOT NULL,
	"profile_icon_id" integer NOT NULL,
	"individual_position" text NOT NULL,
	"team_id" integer NOT NULL,
	"win" boolean NOT NULL,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL,
	"assists" integer NOT NULL,
	"total_damage_dealt_to_champions" integer NOT NULL,
	"total_damage_taken" integer NOT NULL,
	"champion_id" integer NOT NULL,
	"champ_level" integer NOT NULL,
	"items" integer[] NOT NULL,
	"cs" integer NOT NULL,
	"vs_summoner_puuid" text,
	"damage_dealt_to_objectives" integer NOT NULL,
	"dragon_kills" integer NOT NULL,
	"vision_score" integer NOT NULL,
	"largest_critical_strike" integer NOT NULL,
	"solo_kills" integer NOT NULL,
	"ward_takedowns" integer NOT NULL,
	"inhibitor_kills" integer NOT NULL,
	"turret_kills" integer NOT NULL,
	"spell_ids" integer[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"match_id" text PRIMARY KEY NOT NULL,
	"game_creation_ms" bigint NOT NULL,
	"game_duration_sec" integer NOT NULL,
	"queue_id" integer NOT NULL,
	"platform_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note" (
	"puuid" text NOT NULL,
	"user_id" text NOT NULL,
	"note" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "summoner_refresh" (
	"puuid" text PRIMARY KEY NOT NULL,
	"last_game_creation_epoch_sec" integer,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistic" (
	"puuid" text NOT NULL,
	"queue_type" text NOT NULL,
	"latest_league_entry_id" uuid NOT NULL,
	"main_individual_position" text,
	"main_champion_id" integer NOT NULL,
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
	"stats_by_individual_position" jsonb NOT NULL,
	"stats_by_opposite_individual_position_champion_id" jsonb NOT NULL,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "statistic_puuid_queue_type_pk" PRIMARY KEY("puuid","queue_type")
);
--> statement-breakpoint
CREATE TABLE "summoner" (
	"puuid" text PRIMARY KEY NOT NULL,
	"display_riot_id" text NOT NULL,
	"riot_id" text NOT NULL,
	"normalized_riot_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"profile_icon_id" integer NOT NULL,
	"summoner_level" integer NOT NULL,
	"region" text NOT NULL,
	"verified_user_id" text,
	"is_main" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folowing" ADD CONSTRAINT "folowing_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folowing" ADD CONSTRAINT "folowing_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_entry" ADD CONSTRAINT "league_entry_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_summoner" ADD CONSTRAINT "match_summoner_match_id_match_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note" ADD CONSTRAINT "note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD CONSTRAINT "summoner_refresh_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_latest_league_entry_id_league_entry_id_fk" FOREIGN KEY ("latest_league_entry_id") REFERENCES "public"."league_entry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "summoner" ADD CONSTRAINT "summoner_verified_user_id_user_id_fk" FOREIGN KEY ("verified_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_following_puuid_user_id" ON "folowing" USING btree ("puuid","user_id");--> statement-breakpoint
CREATE INDEX "idx_le_puuid" ON "league_entry" USING btree ("puuid");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_le_puuid_queue_day" ON "league_entry" USING btree ("puuid","queue_type","created_day");--> statement-breakpoint
CREATE INDEX "idx_fms_match" ON "match_summoner" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_fms_puuid" ON "match_summoner" USING btree ("puuid");--> statement-breakpoint
CREATE INDEX "idx_ms_puuid_matchid" ON "match_summoner" USING btree ("puuid","match_id");--> statement-breakpoint
CREATE INDEX "idx_ms_match_puuid" ON "match_summoner" USING btree ("match_id","puuid");--> statement-breakpoint
CREATE INDEX "idx_match_game_time" ON "match" USING btree ("game_creation_ms","match_id");--> statement-breakpoint
CREATE INDEX "idx_match_queue_time" ON "match" USING btree ("queue_id","game_creation_ms");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_note_puuid_user_id" ON "note" USING btree ("puuid","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ids_riot_id" ON "summoner" USING btree ("riot_id");--> statement-breakpoint
CREATE INDEX "idx_normalized_riot_id" ON "summoner" USING btree ("normalized_riot_id");