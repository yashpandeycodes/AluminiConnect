import { prisma } from "@/lib/prisma";
import { profileRepository } from "@/repositories/profileRepository";
import { studentProfileSchema, alumniProfileSchema } from "@/validators/profileValidators";
import { z } from "zod";
import { Result } from "@/types";
import { StudentProfile, AlumniProfile } from "@prisma/client";

export const profileService = {
  async getProfile(userId: string, role: string): Promise<Result<StudentProfile | AlumniProfile | null>> {
    try {
      const profile = await profileRepository.getProfileByUserId(userId, role);
      return { success: true, data: profile };
    } catch (error: unknown) {
      console.error("Get profile error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile." } };
    }
  },

  async getPublicProfile(userId: string): Promise<Result<unknown>> {
    try {
      // Look up User first to get role, name, email, etc.
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          collegeEmail: true,
          graduationYear: true,
          role: true,
          alumniProfile: true,
          studentProfile: true
        }
      });

      if (!user) {
        return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };
      }

      // Return the public shape without exposing passwords, tokens, etc.
      return { success: true, data: user };
    } catch (error: unknown) {
      console.error("Get public profile error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile." } };
    }
  },

  async updateProfile(userId: string, role: string, data: unknown): Promise<Result<StudentProfile | AlumniProfile>> {
    try {
      if (role === 'STUDENT') {
        const parsed = studentProfileSchema.parse(data);
        const profile = await profileRepository.upsertStudentProfile(userId, parsed);
        return { success: true, data: profile };
      } else if (role === 'ALUMNI') {
        const parsed = alumniProfileSchema.parse(data);
        const profile = await profileRepository.upsertAlumniProfile(userId, parsed);
        return { success: true, data: profile };
      } else {
        return { success: false, error: { code: "INVALID_ROLE", message: "Invalid role for profile updates." } };
      }
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return { success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } };
      }
      console.error("Update profile error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update profile." } };
    }
  }
};
