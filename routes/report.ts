import { jwtMiddleware } from "@utils/jwtMiddleware";
import { Hono } from "hono";

export const reportRoutes = new Hono();
reportRoutes.use(jwtMiddleware);

reportRoutes.get("/", async (c) => {
  return c.json({
    status: 200,
    message: "Success!",
    data: "success get report",
  });
});
