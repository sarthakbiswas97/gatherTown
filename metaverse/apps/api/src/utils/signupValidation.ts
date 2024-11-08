import { z } from "zod";

const UserType = z.enum(["admin", "user"]);

export const SignupSchema = z.object({
  username: z.string().min(5, "Mininum 5 characters username"),
  password: z.string().min(6, "Minimum 6 characters password"),
  type: UserType,
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string()
})

// export type SignupInput = z.infer<typeof SignupSchema>
