import { z } from "zod";

export const GenerateTimelineSchema = z.object({
  weeklyHours: z.number().min(1).max(168).optional().default(8)
});
