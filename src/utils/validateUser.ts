import { z } from "zod";

export const userSchema = z.object({
  googleId: z.string().nonempty(),
  name: z.string().min(2),
  email: z.string().email(),
  avatarUrl: z.string().url(),
});

