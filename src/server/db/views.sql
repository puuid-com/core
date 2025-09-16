CREATE MATERIALIZED VIEW champion_main_position_stats_mv AS
WITH agg AS (
  SELECT
    ms.champion_id,
    ms.position,
    COUNT(*) AS games_count,
    SUM(CASE WHEN ms.win THEN 1 ELSE 0 END) AS wins,
    COUNT(*) - SUM(CASE WHEN ms.win THEN 1 ELSE 0 END) AS losses,
    AVG((ms.kills + ms.assists)::numeric / GREATEST(ms.deaths, 1)::numeric) AS avg_kda
  FROM match_summoner AS ms
  GROUP BY ms.champion_id, ms.position
)
SELECT DISTINCT ON (champion_id)
  champion_id,
  position AS main_position,
  games_count,
  wins,
  losses,
  ROUND(100.0 * wins::numeric / NULLIF(games_count, 0)::numeric, 2) AS winrate_pct,
  ROUND(avg_kda, 3) AS avg_kda
FROM agg
WHERE position IS NOT NULL
ORDER BY champion_id, games_count DESC, position NULLS LAST;

ALTER MATERIALIZED VIEW champion_main_position_stats_mv OWNER TO doadmin;

CREATE UNIQUE INDEX IF NOT EXISTS uq_champ_main_pos_mv
  ON champion_main_position_stats_mv USING btree (champion_id);
