ALTER TABLE "user_page" DROP CONSTRAINT "uq_name";--> statement-breakpoint
ALTER TABLE "match_comment" ALTER COLUMN "user_page_summoner_id" SET DATA TYPE uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_name" ON "user_page" USING btree ("normalized_name","display_name") WHERE "user_page"."is_public" = TRUE;