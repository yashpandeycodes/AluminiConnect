import { z } from "zod";

export const createOpportunitySchema = z.object({
  company: z.string().min(2, "Company name must be at least 2 characters."),
  role: z.string().min(2, "Role must be at least 2 characters."),
  eligibility: z.string().min(5, "Eligibility criteria must be provided."),
  requiredSkills: z.array(z.string()).min(1, "At least one required skill is needed."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format for deadline.",
  }),
  applicationLink: z.string().url("Must be a valid URL."),
});

export const requestReferralSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity ID is required."),
});

export const updateReferralStatusSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED", "COMPLETED"], {
    message: "Status must be PENDING, ACCEPTED, REJECTED, or COMPLETED"
  })
});
