import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoutes } from "@routes/auth";
import { transactionRoutes } from "@routes/transaction";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { reportRoutes } from "@routes/report";
import { assetRoutes } from "@routes/asset";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:8080", "https://dinero.bayubit.com"],
  })
);
app.use(
  "*",
  csrf({
    origin: ["http://localhost:5173", "http://localhost:8080", "https://dinero.bayubit.com"],
  })
);

app
  .basePath("/v1")
  .route("/auth", authRoutes)
  .route("/transaction", transactionRoutes)
  .route("/report", reportRoutes)
  .route("/asset", assetRoutes);

app.get("/v1/test", (c) => {
  return c.text("Welcome to swordfish, Spike!");
});

export default app;
