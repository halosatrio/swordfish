import { Hono } from "hono";
import { userValidationSchema as userValidation } from "../validationSchema";
import { zValidator } from "@hono/zod-validator";
// TODO:
// - register: handle payload, validate, hash password
// - login: handle payload, validate, generate JWT

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

      return c.json({
        status: 200,
        messsage: "Success register user!",
        data: bcryptHash,
      });
    }
  )
  .post("/login", async (c) => {
    return c.json({
      status: 200,
      message: "Success!",
      data: "token jwt",
    });
  })
  .get("/user", async (c) => {
    return c.json({
      status: 200,
      message: "Success!",
      data: "user data",
    });
  });
