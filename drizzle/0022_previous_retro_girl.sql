ALTER TABLE "user_page" DROP CONSTRAINT "user_page_display_name_unique";--> statement-breakpoint
ALTER TABLE "user_page" ADD CONSTRAINT "uq_name" UNIQUE("normalized_name","display_name");