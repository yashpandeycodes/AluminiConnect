import { z } from "zod";

export const studentProfileSchema = z.object({
  department: z.string().min(2, "Department must be provided.").max(100),
  skills: z.array(z.string().max(50)).min(1, "At least one skill is required.").max(50),
  projects: z.string().optional().nullable(), // Can be made stricter based on UI implementation
  resumeUrl: z.string().url().max(500).optional().nullable(),
});

export const alumniProfileSchema = z.object({
  company: z.string().min(2, "Company must be provided.").max(100),
  jobRole: z.string().min(2, "Job role must be provided.").max(100),
  department: z.string().min(2, "Department must be provided.").max(100),
  industry: z.string().min(2, "Industry must be provided.").max(100),
  experienceYrs: z.number().int().min(0, "Experience years cannot be negative.").max(100),
  skills: z.array(z.string().max(50)).min(1, "At least one skill is required.").max(50),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
export type AlumniProfileInput = z.infer<typeof alumniProfileSchema>;
