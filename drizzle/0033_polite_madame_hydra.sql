ALTER TABLE "league" ALTER COLUMN "created_day" SET DEFAULT (now() at time zone 'UTC')::date;--> statement-breakpoint
ALTER TABLE "league" ALTER COLUMN "created_day" SET NOT NULL;