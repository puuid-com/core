CREATE TABLE "user_page" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text,
	"display_name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"description" text,
	"profile_image" text NOT NULL,
	"x_username" text,
	"twitch_username" text,
	"text" text NOT NULL,
	"is_public" boolean NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_page_display_name_unique" UNIQUE("display_name")
);
--> statement-breakpoint
ALTER TABLE "user_page" ADD CONSTRAINT "user_page_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx" ON "user_page" USING btree ("display_name","is_public");