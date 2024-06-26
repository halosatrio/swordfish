import { db } from "@db/index";
import { transactionsTable } from "@db/schema";
import { zValidator } from "@hono/zod-validator";
import type { JwtPayloadType } from "@lib/common";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import { transactionValidationSchema as transactionValidation } from "@utils/validationSchema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

// TODO:

export const transactionRoutes = new Hono();
transactionRoutes.use(jwtMiddleware);

transactionRoutes
  .get("/", async (c) => {
    // TODO:
    // query params limit, date: start & end, category,
    // do i need to add is_active to transaction (?)
    const jwtPayload: JwtPayloadType = c.get("jwtPayload");

    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.user_id, jwtPayload.sub));

    return c.json({
      status: 200,
      message: "Success!",
      data: transactions,
    });
  })
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
          amount: body.amount,
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
  .put("/", async (c) => {
    // TODO:
    // add endpoint /:id. PUT by transaction id
    return c.json({
      status: 200,
      message: "Success!",
      data: "Success update transaction",
    });
  })
  .delete("/", async (c) => {
    // TODO:
    // add endpoint /:id. DELETE by transaction id
    return c.json({
      status: 200,
      message: "Success!",
      data: "Success delete transaction",
    });
  });
