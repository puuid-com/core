CREATE TABLE "leaderboard_entry" (
	"leaderboard_id" uuid NOT NULL,
	"league_id" uuid NOT NULL,
	"day_index" integer NOT NULL,
	"last_day_index" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leaderboard_entry_league_id_unique" UNIQUE("league_id")
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tier" text NOT NULL,
	"queue" text NOT NULL,
	"region" text NOT NULL,
	"created_day" date DEFAULT (now() at time zone 'UTC')::date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "leaderboard_entry_leaderboard_id_leaderboard_id_fk" FOREIGN KEY ("leaderboard_id") REFERENCES "public"."leaderboard"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard_entry" ADD CONSTRAINT "leaderboard_entry_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_leaderboard_idx_unique" ON "leaderboard" USING btree ("tier","queue","region","created_day");