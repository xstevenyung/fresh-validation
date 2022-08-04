import { z } from "fresh-validation";

export default {
  username: z.string().min(2),
  password: z.string().min(8),
  count: z.number().min(1),
  date: z.date().min(new Date()),
  agree: z.boolean(),
  runtime: z.enum(["bun", "deno"]),
};
