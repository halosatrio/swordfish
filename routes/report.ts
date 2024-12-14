import { db } from "@db/index";
import { transactionsTable } from "@db/schema";
import { zValidator } from "@hono/zod-validator";
import type { JwtPayloadType } from "@lib/common";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import { annualReportQuerySchema, quarterReportQuerySchema } from "@utils/validationSchema";
import dayjs from "dayjs";
import { and, between, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";

const QUARTER_MONTH: { [key: string]: string[] } = {
  "1": ["january", "february", "march"],
  "2": ["april", "may", "june"],
  "3": ["july", "august", "september"],
  "4": ["october", "november", "december"],
};
const MONTHS: string[] = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

// extract/refactor recurring functions
const getFirstDate = (year: string, q: string, month: number) =>
  dayjs(`${year} ${QUARTER_MONTH[q][month]}`).startOf("month").format("YYYY-MM-DD");
const getLastDate = (year: string, q: string, month: number) =>
  dayjs(`${year} ${QUARTER_MONTH[q][month]}`).endOf("month").format("YYYY-MM-DD");

const getQuarterQuery = (jwt: JwtPayloadType, date1: string, date2: string, category: string[]) =>
  db
    .select({
      category: transactionsTable.category,
      amount: sql<number>`cast(sum(${transactionsTable.amount}) as int)`,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, jwt.sub),
        eq(transactionsTable.is_active, true),
        inArray(transactionsTable.category, category),
        date1 && date2 ? between(transactionsTable.date, date1, date2) : undefined
      )
    )
    .groupBy(transactionsTable.category);

// function to check category in non-essentials is present in payload
const checkCategory = (resQuery: any[], categories: string[]) => {
  if (resQuery.length === 0) {
    return categories.map((item) => ({
      category: item,
      amount: 0,
    }));
  } else {
    const reportCategories = resQuery.map((item) => item.category);

    // Finding the nonEssentials that don't appear in reportCategories and creating the missing objects
    const missingItems = categories
      .filter((item) => !reportCategories.includes(item))
      .map((missingCategory) => ({ category: missingCategory, amount: 0 }));

    // Combining the existing month1 array with the missing items
    return [...resQuery, ...missingItems];
  }
};

// start Route Functions
export const reportRoutes = new Hono();
reportRoutes.use(jwtMiddleware);

reportRoutes
  .get(
    "/quarter/essentials",
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
        return c.json({ status: 500, message: "Query 'year' is not a number!" }, 500);
      }
      if (!parseInt(q)) {
        return c.json({ status: 500, message: "Query 'q' is not a number!" }, 500);
      }

      // TODO: define date range based on year and q from query
      let month1: string[] = [getFirstDate(year, q, 0), getLastDate(year, q, 0)];
      let month2: string[] = [getFirstDate(year, q, 1), getLastDate(year, q, 1)];
      let month3: string[] = [getFirstDate(year, q, 2), getLastDate(year, q, 2)];
      const essentials = ["makan", "cafe", "utils", "errand", "bensin", "olahraga"];

      const resMonth1 = await getQuarterQuery(jwtPayload, month1[0], month1[1], essentials);
      const resMonth2 = await getQuarterQuery(jwtPayload, month2[0], month2[1], essentials);
      const resMonth3 = await getQuarterQuery(jwtPayload, month3[0], month3[1], essentials);

      return c.json({
        status: 200,
        message: "Success!",
        data: {
          month1: checkCategory(resMonth1, essentials),
          month2: checkCategory(resMonth2, essentials),
          month3: checkCategory(resMonth3, essentials),
        },
      });
    }
  )
  .get(
    "/quarter/non-essentials",
    zValidator("query", quarterReportQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: 400,
            message: `Failed get report - quarter non-essentials  [Errors - query params]:${result.error.issues.map(
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
        return c.json({ status: 500, message: "Query 'year' is not a number!" }, 500);
      }
      if (!parseInt(q)) {
        return c.json({ status: 500, message: "Query 'q' is not a number!" }, 500);
      }

      // TODO: define date range based on year and q from query
      let month1: string[] = [getFirstDate(year, q, 0), getLastDate(year, q, 0)];
      let month2: string[] = [getFirstDate(year, q, 1), getLastDate(year, q, 1)];
      let month3: string[] = [getFirstDate(year, q, 2), getLastDate(year, q, 2)];
      const nonEssentials = ["misc", "family", "transport", "traveling", "healthcare", "date"];

      const resMonth1 = await getQuarterQuery(jwtPayload, month1[0], month1[1], nonEssentials);
      const resMonth2 = await getQuarterQuery(jwtPayload, month2[0], month2[1], nonEssentials);
      const resMonth3 = await getQuarterQuery(jwtPayload, month3[0], month3[1], nonEssentials);

      return c.json({
        status: 200,
        message: "Success!",
        data: {
          month1: checkCategory(resMonth1, nonEssentials),
          month2: checkCategory(resMonth2, nonEssentials),
          month3: checkCategory(resMonth3, nonEssentials),
        },
      });
    }
  )
  .get(
    "/quarter/shopping",
    zValidator("query", quarterReportQuerySchema, (result, c) => {
      if (!result.success) {
        return c.json(
          {
            status: 400,
            message: `Failed get report - quarter shopping  [Errors - query params]:${result.error.issues.map(
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
        return c.json({ status: 500, message: "Query 'year' is not a number!" }, 500);
      }
      if (!parseInt(q)) {
        return c.json({ status: 500, message: "Query 'q' is not a number!" }, 500);
      }

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
              eq(transactionsTable.category, "belanja"),
              date1 && date2 ? between(transactionsTable.date, date1, date2) : undefined
            )
          )
          .groupBy(transactionsTable.category);

      // TODO: define date range based on year and q from query
      let month1: string[] = [getFirstDate(year, q, 0), getLastDate(year, q, 0)];
      let month2: string[] = [getFirstDate(year, q, 1), getLastDate(year, q, 1)];
      let month3: string[] = [getFirstDate(year, q, 2), getLastDate(year, q, 2)];

      const resMonth1 = await getQuarterQuery(month1[0], month1[1]);
      const resMonth2 = await getQuarterQuery(month2[0], month2[1]);
      const resMonth3 = await getQuarterQuery(month3[0], month3[1]);

      return c.json({
        status: 200,
        message: "Success!",
        data: {
          month1: resMonth1.length !== 0 ? resMonth1[0].amount : 0,
          month2: resMonth2.length !== 0 ? resMonth2[0].amount : 0,
          month3: resMonth3.length !== 0 ? resMonth3[0].amount : 0,
        },
      });
    }
  )
  .get(
    "/annual",
    zValidator("query", annualReportQuerySchema, (result, c) => {
      if (!result.success) {
        const errors = result.error.issues
          .map((item) => `${item.path[0]} ${item.message}`)
          .join(", ");
        return c.json(
          {
            status: 400,
            message: `Failed to get report - annual [Errors - query params]: ${errors}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const jwtPayload: JwtPayloadType = c.get("jwtPayload");
      const { year } = c.req.query();

      // Validate 'year' query parameter
      const parsedYear = parseInt(year);
      if (isNaN(parsedYear)) {
        return c.json({ status: 500, message: "Query 'year' is not a number!" }, 500);
      }

      // Function to generate start and end dates for a given month
      const getMonthDateRange = (month: number) => ({
        start_date: dayjs(`${year} ${MONTHS[month]}`).startOf("month").format("YYYY-MM-DD"),
        end_date: dayjs(`${year} ${MONTHS[month]}`).endOf("month").format("YYYY-MM-DD"),
      });

      // Function to get annual report for a given date range
      const getAnnualReportPerMonthQuery = (start_date: string, end_date: string) =>
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
              between(transactionsTable.date, start_date, end_date)
            )
          )
          .groupBy(transactionsTable.category);

      // Get annual report data for each month
      const monthlyReports = await Promise.all(
        Array.from({ length: 12 }, (_, i) => {
          const { start_date, end_date } = getMonthDateRange(i);
          return getAnnualReportPerMonthQuery(start_date, end_date);
        })
      );

      // Get the annual total
      const annualTotal = await getAnnualReportPerMonthQuery(
        dayjs(`${year}`).startOf("year").format("YYYY-MM-DD"),
        dayjs(`${year}`).endOf("year").format("YYYY-MM-DD")
      );

      return c.json({
        status: 200,
        message: "Success!",
        data: {
          month1: monthlyReports[0],
          month2: monthlyReports[1],
          month3: monthlyReports[2],
          month4: monthlyReports[3],
          month5: monthlyReports[4],
          month6: monthlyReports[5],
          month7: monthlyReports[6],
          month8: monthlyReports[7],
          month9: monthlyReports[8],
          month10: monthlyReports[9],
          month11: monthlyReports[10],
          month12: monthlyReports[11],
          total: annualTotal,
        },
      });
    }
  )
  .get(
    "/annual/cashflow",
    zValidator("query", annualReportQuerySchema, (result, c) => {
      if (!result.success) {
        const errors = result.error.issues
          .map((item) => `${item.path[0]} ${item.message}`)
          .join(", ");
        return c.json(
          {
            status: 400,
            message: `Failed to get report - annual cashflow [Errors - query params]: ${errors}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const jwtPayload: JwtPayloadType = c.get("jwtPayload");
      const { year } = c.req.query();

      // Validate 'year' query parameter
      const parsedYear = parseInt(year);
      if (isNaN(parsedYear)) {
        return c.json({ status: 500, message: "Query 'year' is not a number!" }, 500);
      }

      const start_date = dayjs(`${year}`).startOf("year").format("YYYY-MM-DD");
      const end_date = dayjs(`${year}`).endOf("year").format("YYYY-MM-DD");

      const res = await db.execute(
        sql`select
          cast(extract(month from date) as int) as month,
          cast(sum(case when type = 'inflow' then amount else 0 end) as int) as inflow,
          cast(sum(case when type = 'outflow' then amount else 0 end) as int) as outflow,
          cast(SUM(CASE WHEN type = 'inflow' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'outflow' THEN amount ELSE 0 END) as int) AS saving
          from ${transactionsTable}
          where
            ${transactionsTable.user_id} = ${jwtPayload.sub} and
            ${transactionsTable.is_active} = true and
            ${transactionsTable.date} between ${start_date} and ${end_date}
          group by month
          order by month
        `
      );

      const resTotal = await db.execute(
        sql`select
          cast(sum(case when type = 'inflow' then amount else 0 end) as int) as total_inflow,
          cast(sum(case when type = 'outflow' then amount else 0 end) as int) as total_outflow,
          cast(sum(case when type = 'inflow' then amount else 0 end) - sum(case when type = 'outflow' then amount else 0 end) as int) as total_saving
          from ${transactionsTable}
          where
            ${transactionsTable.user_id} = ${jwtPayload.sub} and
            ${transactionsTable.is_active} = true and
            ${transactionsTable.date} between ${start_date} and ${end_date}
        `
      );

      // function to expand empty month value
      function expandToTwelveMonths(data: any[]) {
        // Create an object to easily access existing data by month
        const dataByMonth = data.reduce((acc, item) => {
          acc[item.month] = item;
          return acc;
        }, {});

        // Create the full 12-month array
        const fullYearData = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          return (
            dataByMonth[month] || {
              month,
              inflow: 0,
              outflow: 0,
              saving: 0,
            }
          );
        });

        return fullYearData;
      }

      return c.json({
        status: 200,
        message: "Success!",
        data: { monthly: expandToTwelveMonths(res), total: resTotal[0] },
      });
    }
  );
