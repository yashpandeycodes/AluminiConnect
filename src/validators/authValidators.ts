import { z } from "zod";

const ALLOWED_DOMAIN = "@nitjsr.ac.in";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  collegeEmail: z.string().email("Invalid email format.").toLowerCase().refine(
    (email) => {
      // Format: Year (4 digits) + Course/Branch (letters) + Roll No (3 digits) @nitjsr.ac.in
      // Example: 2025ugcs030@nitjsr.ac.in
      const regex = /^\d{4}[a-z]+\d{3}@nitjsr\.ac\.in$/;
      return regex.test(email);
    }, 
    {
      message: "Email must be a valid NIT JSR student ID (e.g., 2025ugcs030@nitjsr.ac.in).",
    }
  ),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  graduationYear: z.number().int().min(1950, "Invalid graduation year.").max(new Date().getFullYear() + 10, "Graduation year is too far in the future."),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format.").toLowerCase(),
  password: z.string().min(1, "Password is required."),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
