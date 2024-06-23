import { db } from "@db/index";
import { transactionsTable } from "@db/schema";
import { zValidator } from "@hono/zod-validator";
import type { JwtPayloadType } from "@lib/common";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import { transactionValidationSchema as transactionValidation } from "@utils/validationSchema";
import { Hono } from "hono";

// TODO:

export const transactionRoutes = new Hono();
transactionRoutes.use(jwtMiddleware);

transactionRoutes
  .post(
    "/create",
    zValidator("json", transactionValidation, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: 400,
            message: `Failed register user! [Errors]:${result.error.issues.map(
              (item) => ` ${item.path[0]} ${item.message}`
            )}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const jwtPayload: JwtPayloadType = c.get("jwtPayload");
      const body = c.req.valid("json");

      let res = await db
        .insert(transactionsTable)
        .values({
          user_id: jwtPayload.sub,
          type: body.type,
          amount: body.amount.toString(),
          category: body.category,
          date: body.date, // Convert date string to Date object
          note: body.note,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning()
        .then((res) => res[0]);

      return c.json({
        status: 200,
        messsage: "Success create transaction!",
        data: res,
      });
    }
  )
  .get("/", async (c) => {
    const jwtPayload: JwtPayloadType = c.get("jwtPayload");
    return c.json({
      status: 200,
      message: "Success!",
      data: jwtPayload,
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
