CREATE TABLE "match-comment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"puuid" text NOT NULL,
	"match_id" text NOT NULL,
	"text" text NOT NULL,
	"tags" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match-comment" ADD CONSTRAINT "match-comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match-comment" ADD CONSTRAINT "match-comment_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match-comment" ADD CONSTRAINT "match-comment_match_id_match_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mc_matchid" ON "match-comment" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_mc_userid" ON "match-comment" USING btree ("user_id");