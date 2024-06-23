import { CATEGORIES } from "@db/constant";
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

export const transactionValidationSchema = z.object({
  type: z.enum(["inflow", "outflow"]),
  amount: z.number().positive(),
  category: z.nativeEnum(CATEGORIES),
  date: z.string().date(),
  note: z.string().optional(),
});

// export type Transaction = z.infer<typeof transactionValidationSchema>;
