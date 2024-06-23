import {
  text,
  timestamp,
  date,
  pgSchema,
  serial,
  numeric,
  integer,
} from "drizzle-orm/pg-core";

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
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(), // Will be validated in application code
  date: date("date").notNull(),
  note: text("note"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
