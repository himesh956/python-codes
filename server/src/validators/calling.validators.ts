import { z } from "zod";

export const initiateCallSchema = z.object({
  body: z.object({
    receiverId: z.string().min(1),
    contextType: z.enum(["BOOKING", "APPLICATION"]),
    contextId: z.string().min(1),
  }),
});