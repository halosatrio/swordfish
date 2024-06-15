import { Hono } from "hono";

// TODO:

export const transactionRoutes = new Hono()
  .get("/", async (c) => {
    return c.json({
      status: 200,
      message: "Success!",
      data: "transaction data",
    });
  })
  .post("/create", async (c) => {
    return c.json({
      status: 200,
      messsage: "Success create transaction!",
    });
  })
  .put("/transaction", async (c) => {
    return c.json({
      status: 200,
      message: "Success!",
      data: "Success update transaction",
    });
  })
  .delete("/transaction", async (c) => {
    return c.json({
      status: 200,
      message: "Success!",
      data: "Success delete transaction",
    });
  });
