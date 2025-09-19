DROP INDEX "idx";--> statement-breakpoint
CREATE INDEX "idx" ON "user_page" USING btree ("normalized_name","is_public");