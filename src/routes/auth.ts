import { Hono } from "hono";

// TODO:
// - register: handle payload, validate, hash password
// - login: handle payload, validate, generate JWT

export const authRoutes = new Hono()
  .post("/register", async (c) => {
    return c.json({
      status: 200,
      messsage: "Success register user!",
    });
  })
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
