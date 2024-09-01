import { db } from "@db/index";
import { transactionsTable } from "@db/schema";
import { zValidator } from "@hono/zod-validator";
import type { JwtPayloadType } from "@lib/common";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import { quarterReportQuerySchema } from "@utils/validationSchema";
import dayjs from "dayjs";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";

export const reportRoutes = new Hono();
reportRoutes.use(jwtMiddleware);

reportRoutes.get(
  "/essentials/quarter",
  zValidator("query", quarterReportQuerySchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          status: 400,
          message: `Failed get report - quarter essentials  [Errors - query params]:${result.error.issues.map(
            (item) => ` ${item.path[0]} ${item.message}`
          )}`,
        },
        400
      );
    }
  }),
  async (c) => {
    const jwtPayload: JwtPayloadType = c.get("jwtPayload");

    // catch error if query is not number
    const { year, q } = c.req.query();
    if (!parseInt(year)) {
      return c.json(
        { status: 500, message: "Query 'year' is not a number!" },
        500
      );
    }
    if (!parseInt(q)) {
      return c.json(
        { status: 500, message: "Query 'q' is not a number!" },
        500
      );
    }

    // TODO: define date range based on year and q from query
    // let date_start = dayjs

    const existingQuarterMonthOne = await db
      .select({
        category: transactionsTable.category,
        amount: sql<number>`cast(sum(${transactionsTable.amount}) as int)`,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.user_id, jwtPayload.sub),
          eq(transactionsTable.is_active, true),
          inArray(transactionsTable.category, [
            "makan",
            "cafe",
            "utils",
            "errand",
            "bensin",
            "olahraga",
          ])
        )
      )
      .groupBy(transactionsTable.category);

    return c.json({
      status: 200,
      message: "Success!",
      data: existingQuarterMonthOne,
    });
  }
);
