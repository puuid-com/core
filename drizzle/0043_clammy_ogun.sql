ALTER TABLE "summoner_statistic" DROP CONSTRAINT "summoner_statistic_puuid_queue_type_pk";
ALTER TABLE "summoner_statistic" ADD COLUMN "id" uuid PRIMARY KEY NOT NULL;