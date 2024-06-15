import { Hono } from "hono";
import { sign } from "hono/jwt";
import {
  loginUserValidation,
  userValidationSchema as userValidation,
} from "../validationSchema";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import { usersTable } from "../db/schema";
import { eq } from "drizzle-orm";

// TODO:
// get user -> get jwt from auth header -> decrypt -> get email

export const authRoutes = new Hono()
  .post(
    "/register",
    zValidator("json", userValidation, (res, c) => {
      if (!res.success) {
        return c.json(
          {
            status: 400,
            message: `Failed register user! [Errors]:${res.error.issues.map(
              (item) => " " + item.message
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
              (item) => " " + item.message
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
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // Token expires in 24 hours
        };
        const token = await sign(tokenPayload, secret!);

        if (isMatch) {
          return c.json({ status: 200, message: "Success!", data: token });
        } else {
          return c.json({ status: 500, data: "password is incorrect!" }, 500);
        }
      } else c.json({ status: 500, data: "email is not found!" }, 500);
    }
  )
  .get("/user", async (c) => {
    return c.json({
      status: 200,
      message: "Success!",
      data: "user data",
    });
  });
