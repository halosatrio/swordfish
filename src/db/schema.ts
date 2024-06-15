import {
  text,
  index,
  timestamp,
  date,
  boolean,
  integer,
  pgSchema,
  smallint,
  serial,
  varchar,
  primaryKey,
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
