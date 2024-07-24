import { db } from "@db/index";
import { transactionsTable } from "@db/schema";
import { zValidator } from "@hono/zod-validator";
import type { JwtPayloadType } from "@lib/common";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import {
  transactionValidationSchema as transactionValidation,
  transactionQuerySchema,
  monthlySummaryQuerySchema,
} from "@utils/validationSchema";
import { and, asc, between, eq, sql } from "drizzle-orm";
import { Hono } from "hono";

// TODO:

export const transactionRoutes = new Hono();
transactionRoutes.use(jwtMiddleware);

transactionRoutes
  .get(
    "/",
    zValidator("query", transactionQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: 400,
            message: `Failed get transaction! [Errors]:${result.error.issues.map(
              (item) => ` ${item.path[0]} ${item.message}`
            )}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const jwtPayload: JwtPayloadType = c.get("jwtPayload");
      const { date_start, date_end, category } = c.req.query();

      const transactions = await db
        .select()
        .from(transactionsTable)
        .orderBy(asc(transactionsTable.date), asc(transactionsTable.id))
        .where(
          and(
            eq(transactionsTable.user_id, jwtPayload.sub),
            eq(transactionsTable.is_active, true),
            category ? eq(transactionsTable.category, category) : undefined,
            date_start && date_end
              ? between(transactionsTable.date, date_start, date_end)
              : undefined
          )
        )
        .limit(200); // max transaction record per month is around 150ish

      return c.json({
        status: 200,
        message: "Success!",
        data: transactions,
      });
    }
  )
  .post(
    "/create",
    zValidator("json", transactionValidation, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: 400,
            message: `Failed record transaction! [Errors]:${result.error.issues.map(
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
          notes: body.notes,
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
  .put(
    "/:id{[0-9]+}",
    zValidator("json", transactionValidation, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: 400,
            message: `Failed update transaction! [Errors - query params]:${result.error.issues.map(
              (item) => ` ${item.path[0]} ${item.message}`
            )}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const id = Number.parseInt(c.req.param("id"));
      const body = c.req.valid("json");
      const jwtPayload: JwtPayloadType = c.get("jwtPayload");

      const existingTransaction = await db
        .select()
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.user_id, jwtPayload.sub),
            eq(transactionsTable.id, id),
            eq(transactionsTable.is_active, true)
          )
        );

      if (existingTransaction.length < 1) {
        return c.json({ status: 404, message: "Habit not found!" }, 404);
      }

      const updatedTransaction = await db
        .update(transactionsTable)
        .set({
          type: body.type,
          amount: body.amount,
          category: body.category,
          date: body.date, // Convert date string to Date object
          notes: body.notes,
          updated_at: new Date(),
        })
        .where(
          and(
            eq(transactionsTable.user_id, jwtPayload.sub),
            eq(transactionsTable.id, id)
          )
        )
        .returning()
        .then((res) => res[0]);

      return c.json({
        status: 200,
        message: "Success update transaction!",
        data: updatedTransaction,
      });
    }
  )
  .delete("/:id{[0-9]+}", async (c) => {
    const id = Number.parseInt(c.req.param("id"));
    const jwtPayload: JwtPayloadType = c.get("jwtPayload");

    const existingTransaction = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.user_id, jwtPayload.sub),
          eq(transactionsTable.id, id),
          eq(transactionsTable.is_active, true)
        )
      );

    if (existingTransaction.length < 1) {
      return c.json({ status: 404, message: "Habit not found!" }, 404);
    }

    const deleteTransaction = await db
      .update(transactionsTable)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(transactionsTable.user_id, jwtPayload.sub),
          eq(transactionsTable.id, id)
        )
      )
      .returning()
      .then((res) => res[0]);

    return c.json({
      status: 200,
      message: "Success delete transaction!",
      data: deleteTransaction,
    });
  })
  .get(
    "/monthly-summary",
    zValidator("query", monthlySummaryQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: 400,
            message: `Failed get transaction - monthly summary! [Errors - query params]:${result.error.issues.map(
              (item) => ` ${item.path[0]} ${item.message}`
            )}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const jwtPayload: JwtPayloadType = c.get("jwtPayload");
      const { date_start, date_end, category } = c.req.query();

      const transactions = await db
        .select({
          category: transactionsTable.category,
          total_amount: sql<number>`cast(sum(${transactionsTable.amount}) as int)`,
          count: sql<number>`cast(count(${transactionsTable.id}) as int)`,
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.user_id, jwtPayload.sub),
            eq(transactionsTable.is_active, true),
            date_start && date_end
              ? between(transactionsTable.date, date_start, date_end)
              : undefined
          )
        )
        .groupBy(transactionsTable.category);

      return c.json({
        status: 200,
        message: "Success!",
        data: transactions,
      });
    }
  );
