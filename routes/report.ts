import { db } from "@db/index";
import { transactionsTable } from "@db/schema";
import { zValidator } from "@hono/zod-validator";
import type { JwtPayloadType } from "@lib/common";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import { quarterReportQuerySchema } from "@utils/validationSchema";
import dayjs from "dayjs";
import { and, between, eq, inArray, sql } from "drizzle-orm";
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

    const quarterMonth: { [key: string]: string[] } = {
      "1": ["january", "february", "march"],
      "2": ["april", "may", "june"],
      "3": ["july", "august", "september"],
      "4": ["october", "november", "december"],
    };

    const getFirstDate = (month: number) =>
      dayjs(`${year} ${quarterMonth[q][month]}`)
        .startOf("month")
        .format("YYYY-MM-DD");
    const getLastDate = (month: number) =>
      dayjs(`${year} ${quarterMonth[q][month]}`)
        .endOf("month")
        .format("YYYY-MM-DD");

    // TODO: define date range based on year and q from query
    let month1: string[] = [getFirstDate(0), getLastDate(0)];
    let month2: string[] = [getFirstDate(1), getLastDate(1)];
    let month3: string[] = [getFirstDate(2), getLastDate(2)];
    const essentials = [
      "makan",
      "cafe",
      "utils",
      "errand",
      "bensin",
      "olahraga",
    ];

    const getQuarterQuery = (date1: string, date2: string) =>
      db
        .select({
          category: transactionsTable.category,
          amount: sql<number>`cast(sum(${transactionsTable.amount}) as int)`,
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.user_id, jwtPayload.sub),
            eq(transactionsTable.is_active, true),
            inArray(transactionsTable.category, essentials),
            date1 && date2
              ? between(transactionsTable.date, date1, date2)
              : undefined
          )
        )
        .groupBy(transactionsTable.category);

    const quarterMonth1 = await getQuarterQuery(month1[0], month1[1]);
    const quarterMonth2 = await getQuarterQuery(month2[0], month2[1]);
    const quarterMonth3 = await getQuarterQuery(month3[0], month3[1]);
    const quarterTotal = await getQuarterQuery(month1[0], month3[1]);

    return c.json({
      status: 200,
      message: "Success!",
      data: {
        quarterMonth1,
        quarterMonth2,
        quarterMonth3,
        quarterTotal,
      },
    });
  }
);

reportRoutes.get(
  "/non-essentials/quarter",
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

    const quarterMonth: { [key: string]: string[] } = {
      "1": ["january", "february", "march"],
      "2": ["april", "may", "june"],
      "3": ["july", "august", "september"],
      "4": ["october", "november", "december"],
    };

    const getFirstDate = (month: number) =>
      dayjs(`${year} ${quarterMonth[q][month]}`)
        .startOf("month")
        .format("YYYY-MM-DD");
    const getLastDate = (month: number) =>
      dayjs(`${year} ${quarterMonth[q][month]}`)
        .endOf("month")
        .format("YYYY-MM-DD");

    console.log(getFirstDate(1), getLastDate(1));

    // TODO: define date range based on year and q from query
    let month1: string[] = [getFirstDate(0), getLastDate(0)];
    let month2: string[] = [getFirstDate(1), getLastDate(1)];
    let month3: string[] = [getFirstDate(2), getLastDate(2)];
    const nonEssentials = [
      "family",
      "misc",
      "transport",
      "traveling",
      "date",
      "healthcare",
    ];

    const getQuarterQuery = (date1: string, date2: string) =>
      db
        .select({
          category: transactionsTable.category,
          amount: sql<number>`cast(sum(${transactionsTable.amount}) as int)`,
        })
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.user_id, jwtPayload.sub),
            eq(transactionsTable.is_active, true),
            inArray(transactionsTable.category, nonEssentials),
            date1 && date2
              ? between(transactionsTable.date, date1, date2)
              : undefined
          )
        )
        .groupBy(transactionsTable.category);

    const quarterMonth1 = await getQuarterQuery(month1[0], month1[1]);
    const quarterMonth2 = await getQuarterQuery(month2[0], month2[1]);
    const quarterMonth3 = await getQuarterQuery(month3[0], month3[1]);
    const quarterTotal = await getQuarterQuery(month1[0], month3[1]);

    return c.json({
      status: 200,
      message: "Success!",
      data: {
        quarterMonth1,
        quarterMonth2,
        quarterMonth3,
        quarterTotal,
      },
    });
  }
);
