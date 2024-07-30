import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoutes } from "@routes/auth";
import { transactionRoutes } from "@routes/transaction";
import { cors } from "hono/cors";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173"],
  }),
);

app
  .basePath("/v1")
  .route("/auth", authRoutes)
  .route("/transaction", transactionRoutes);
// TODO:
// report Routes
// assets Routes

app.get("/v1/test", (c) => {
  return c.text("Welcome to swordfish, Spike!");
});

export default app;
