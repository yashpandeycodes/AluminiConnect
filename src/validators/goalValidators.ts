import { z } from "zod";

export const CreateGoalSchema = z.object({
  targetRole: z.string().min(1, "Target role is required"),
  targetCompanies: z.array(z.string()).max(5, "Maximum 5 companies allowed").optional().default([]),
  targetIndustries: z.array(z.string()).max(5, "Maximum 5 industries allowed").optional().default([]),
  preferredLocations: z.array(z.string()).max(5, "Maximum 5 preferred locations allowed").optional().default([]),
  targetPackage: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().default("MEDIUM"),
});

export const UpdateGoalSchema = z.object({
  targetRole: z.string().min(1, "Target role is required").optional(),
  targetCompanies: z.array(z.string()).max(5).optional(),
  targetIndustries: z.array(z.string()).max(5).optional(),
  preferredLocations: z.array(z.string()).max(5).optional(),
  targetPackage: z.string().optional().nullable(),
  deadline: z.string().datetime().optional().nullable(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  status: z.enum(["ACTIVE", "ACHIEVED", "ARCHIVED", "ON_HOLD"]).optional(),
});
