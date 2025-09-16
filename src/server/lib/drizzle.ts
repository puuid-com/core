import { getTableColumns, SQL, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

export const upsert = <T extends PgTable, Q extends keyof T["_"]["columns"]>(table: T) => {
  const cls = getTableColumns(table);

  return Object.entries(cls).reduce(
    (acc, [key, value]) => {
      if (value.primary) return acc;

      acc[key as Q] = sql.raw(`excluded.${value.name}`);

      return acc;
    },
    {} as Record<Q, SQL>,
  );
};
