import { text, timestamp, date, pgSchema, serial, integer, boolean } from "drizzle-orm/pg-core";

export const mySchema = pgSchema("swordfish");

export const usersTable = mySchema.table("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").unique().notNull(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const transactionsTable = mySchema.table("transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  type: text("type").notNull(), // 'inflow' or 'outflow'
  amount: integer("amount").notNull(),
  category: text("category").notNull(), // Will be validated in application code
  date: date("date").notNull(),
  notes: text("notes"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const assetsTable = mySchema.table("assets", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => usersTable.id)
    .notNull(),
  account: text("account").notNull(), // BCA, BLU, BIBIT
  amount: integer("amount").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
