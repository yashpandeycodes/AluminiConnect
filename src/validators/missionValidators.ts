import { z } from "zod";

export const MissionIdParamsSchema = z.object({
  id: z.string().cuid("Invalid mission ID")
});
