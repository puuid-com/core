ALTER TABLE "match_comment" DROP CONSTRAINT "match_comment_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "match_comment" DROP CONSTRAINT "match_comment_puuid_summoner_puuid_fk";
--> statement-breakpoint
DROP INDEX "idx_mc_userid";--> statement-breakpoint
ALTER TABLE "user_page_summoner" ALTER COLUMN "is_public" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "match_comment" ADD COLUMN "user_page_summoner_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_user_page_summoner_id_user_page_summoner_id_fk" FOREIGN KEY ("user_page_summoner_id") REFERENCES "public"."user_page_summoner"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_mc_user_page_summoner_id" ON "match_comment" USING btree ("user_page_summoner_id");--> statement-breakpoint
ALTER TABLE "match_comment" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "match_comment" DROP COLUMN "puuid";