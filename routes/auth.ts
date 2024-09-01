import { Hono } from "hono";
import { sign } from "hono/jwt";
import {
  loginUserValidation,
  userValidationSchema as userValidation,
} from "@utils/validationSchema";
import { zValidator } from "@hono/zod-validator";
import { db } from "@db/index";
import { usersTable } from "@db/schema";
import { eq } from "drizzle-orm";
import { jwtMiddleware } from "@utils/jwtMiddleware";
import type { JwtPayloadType } from "@lib/common";

// TODO:
// get user -> get jwt from auth header -> decrypt -> get email

export const authRoutes = new Hono()
  .post(
    "/register",
    zValidator("json", userValidation, (res, c) => {
      if (!res.success) {
        console.log(res.error);
        return c.json(
          {
            status: 400,
            message: `Failed register user! [Errors]:${res.error.issues.map(
              (item) => ` ${item.path[0]} ${item.message}`
            )}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const body = c.req.valid("json");

      const bcryptHash = await Bun.password.hash(body.password, {
        algorithm: "bcrypt",
        cost: 13,
      });

      let res = await db
        .insert(usersTable)
        .values({
          username: body.username,
          email: body.email,
          password: bcryptHash,
        })
        .returning()
        .then((res) => res[0]);

      return c.json({
        status: 200,
        message: "success register user!",
        data: res,
      });
    }
  )
  .post(
    "/login",
    zValidator("json", loginUserValidation, (res, c) => {
      if (!res.success) {
        return c.json(
          {
            status: 400,
            message: `Login failed! [Errors]: ${res.error.issues.map(
              (item) => ` ${item.path[0]} ${item.message}`
            )}`,
          },
          400
        );
      }
    }),
    async (c) => {
      const body = c.req.valid("json");

      const user = await db
        .select({
          id: usersTable.id,
          email: usersTable.email,
          password: usersTable.password,
        })
        .from(usersTable)
        .where(eq(usersTable.email, body.email));

      if (user.length !== 0) {
        const isMatch = await Bun.password.verify(
          body.password,
          user[0].password
        );

        // Generate JWT
        const secret = process.env.SECRET_KEY;
        const tokenPayload = {
          sub: user[0].id,
          email: body.email,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // Token expires in 7 days
        };
        const token = await sign(tokenPayload, secret!);

        if (isMatch) {
          return c.json({ status: 200, message: "Success!", data: token });
        } else {
          return c.json(
            { status: 500, message: "password is incorrect!" },
            500
          );
        }
      } else
        return c.json({ status: 500, message: "email is not found!" }, 500);
    }
  )
  .get("/user", jwtMiddleware, async (c) => {
    const jwtPayload: JwtPayloadType = c.get("jwtPayload");

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, jwtPayload.email))
      .then((res) => res[0]);

    return c.json({
      status: 200,
      message: "Success!",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  });
