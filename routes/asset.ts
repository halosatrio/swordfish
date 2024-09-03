import { db } from "@db/index";
import { assetsTable } from "@db/schema";
import { zValidator } from "@hono/zod-validator";
import type { JwtPayloadType } from "@lib/common";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import { assetValidationSchema } from "@utils/validationSchema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const assetRoutes = new Hono();
assetRoutes.use(jwtMiddleware);

// TODO:
// get assets
// post records assets

assetRoutes
  .get("/", async (c) => {
    const jwtPayload: JwtPayloadType = c.get("jwtPayload");

    const assets = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.user_id, jwtPayload.sub))
      .limit(200); // max transaction record per month is around 150ish

    return c.json({
      status: 200,
      message: "Success!",
      data: assets,
    });
  })
  .post(
    "/create",
    zValidator("json", assetValidationSchema, (result, c) => {
      if (!result.success) {
        const errors = result.error.issues
          .map((item) => `${item.path[0]} ${item.message}`)
          .join(", ");
        return c.json(
          {
            status: 400,
            message: `Failed to record assets! [Errors]: ${errors}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const jwtPayload: JwtPayloadType = c.get("jwtPayload");
      const body = c.req.valid("json");

      let res = await db
        .insert(assetsTable)
        .values({
          user_id: jwtPayload.sub,
          account: body.account,
          amount: body.amount,
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
  );
