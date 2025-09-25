DROP INDEX "idx_leaderboard_idx_unique";--> statement-breakpoint
ALTER TABLE "leaderboard" ADD COLUMN "date" date NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_leaderboard_idx_unique" ON "leaderboard" USING btree ("tier","queue","region","date");--> statement-breakpoint
ALTER TABLE "leaderboard" DROP COLUMN "created_day";