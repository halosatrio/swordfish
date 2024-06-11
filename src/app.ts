import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoutes } from "./routes/auth";

const app = new Hono();

app.use("*", logger());

app.basePath("/v1").route("/auth", authRoutes);
// TODO:
// transaction Routes
// report Routes
// setup cors

app.get("/v1/test", (c) => {
  return c.text("Welcome to swordfish, Spike!");
});

export default app;
