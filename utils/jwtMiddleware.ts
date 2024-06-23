import { verify } from "hono/jwt";
import { createMiddleware } from "hono/factory";
import type { JWTPayload } from "hono/utils/jwt/types";

export const jwtMiddleware = createMiddleware(async (c, next) => {
  try {
    const authHeader = c.req.header("authorization");
    if (!authHeader) {
      return c.json({ status: 401, message: "Auth header is not found!" }, 401);
    }

    const tokenParts = authHeader.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return c.json(
        { status: 401, message: "Invalid auth header format!" },
        401
      );
    }

    const token = tokenParts[1];
    if (!token) {
      return c.json({ status: 401, message: "Token is Undefined!" }, 401);
    }

    const jwtSecret = process.env.SECRET_KEY;
    if (!jwtSecret)
      return c.json(
        {
          status: 500,
          message: "Internal server error: SECRET_KEY is not set",
        },
        500
      );

    const jwtPayload: JWTPayload = await verify(token, jwtSecret);
    c.set("jwtPayload", jwtPayload);
    return next();
  } catch (error: any) {
    return c.json({ status: 401, message: error.message }, 401);
  }
});
