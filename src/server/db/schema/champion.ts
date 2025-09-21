import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const followingTable = pgTable(
  "champion",
  {
    key: integer("key").notNull().unique(),

    id: text("id").notNull(),
    name: text("name").notNull(),
    normalizedName: text("normalized_name").notNull(),

    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => []
);
