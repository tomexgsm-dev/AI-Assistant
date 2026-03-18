import { pgTable, serial, text, integer, timestamp, date } from "drizzle-orm/pg-core";

export const usageLimits = pgTable("usage_limits", {
  id: serial("id").primaryKey(),
  clientId: text("client_id").notNull(),
  date: date("date").notNull(),
  chatCount: integer("chat_count").notNull().default(0),
  imageCount: integer("image_count").notNull().default(0),
  isPro: integer("is_pro").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
