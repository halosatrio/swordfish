import { z } from "zod";

// validation schema for inserting a user
export const userValidationSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must contain at least 6 character(s)" }),
});

export const loginUserValidation = userValidationSchema.omit({
  username: true,
});
export type loginUserValidation = z.infer<typeof loginUserValidation>;
