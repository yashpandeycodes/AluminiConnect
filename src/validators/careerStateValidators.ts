import { z } from "zod";
import { CareerStateAnalysisSource } from "@prisma/client";

export const rebuildCareerStateSchema = z.object({
  analysisSource: z.nativeEnum(CareerStateAnalysisSource).optional().default(CareerStateAnalysisSource.MANUAL_REFRESH),
  targetRole: z.string().optional()
});
