import { RegisterInput } from "@/validators/authValidators";
import { userRepository } from "@/repositories/userRepository";
import { sendVerificationEmail } from "@/lib/email";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Result } from "@/types";

export const authService = {
  async registerUser(data: RegisterInput): Promise<Result<{ id: string; email: string; isResend?: boolean }>> {
    try {
      // 1. Check if user already exists
      const existingUser = await userRepository.findByEmail(data.collegeEmail);

      // 2. Hash password
      const passwordHash = await bcrypt.hash(data.password, 12);

      // 3. Compute role
      const currentYear = new Date().getFullYear();
      const role = data.graduationYear > currentYear ? "STUDENT" : "ALUMNI";

      // 4. Generate verification token (raw for email, hashed for DB)
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

      let user;

      if (existingUser) {
        if (existingUser.emailVerified) {
          return { success: false, error: { code: "USER_EXISTS", message: "User already exists with this email." } };
        }
        
        // User exists but is not verified. ONLY update the verification token and resend email.
        // We do not update name, password, or other details as per requirements.
        await userRepository.updateUser(existingUser.id, {
          verificationToken: hashedToken,
        });

        // Send the new verification email
        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${rawToken}`;
        await sendVerificationEmail(existingUser.collegeEmail, verificationLink);

        return { 
          success: true, 
          data: { id: existingUser.id, email: existingUser.collegeEmail, isResend: true }
        };
      } else {
        // 5. Create user in DB
        user = await userRepository.createUser({
          name: data.name,
          collegeEmail: data.collegeEmail,
          passwordHash,
          role,
          graduationYear: data.graduationYear,
          verificationToken: hashedToken,
        });
      }

      // 6. Send verification email
      // Assuming frontend route is /verify?token=...
      const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${rawToken}`;
      await sendVerificationEmail(user.collegeEmail, verificationLink);

      return {
        success: true,
        data: { id: user.id, email: user.collegeEmail },
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred during registration." } };
    }
  },

  async verifyEmail(rawToken: string): Promise<Result<null>> {
    try {
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const user = await userRepository.findByVerificationToken(hashedToken);

      if (!user) {
        return { success: false, error: { code: "INVALID_TOKEN", message: "Invalid or expired verification token." } };
      }

      // Check token expiry (24 hours) based on updatedAt
      const tokenAge = Date.now() - user.updatedAt.getTime();
      if (tokenAge > 24 * 60 * 60 * 1000) {
        return { success: false, error: { code: "TOKEN_EXPIRED", message: "Verification token has expired. Please register again to receive a new one." } };
      }

      await userRepository.markEmailVerified(user.id);

      return { success: true, data: null };
    } catch (error) {
      console.error("Verification error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "An error occurred during verification." } };
    }
  },

  async autoTransitionRoles(): Promise<Result<{ updatedCount: number }>> {
    try {
      const currentYear = new Date().getFullYear();
      const studentsToTransition = await userRepository.findStudentsGraduatedBeforeOrIn(currentYear);

      let updatedCount = 0;
      for (const student of studentsToTransition) {
        await userRepository.updateRole(student.id, "ALUMNI");
        updatedCount++;
      }

      return { success: true, data: { updatedCount } };
    } catch (error) {
      console.error("Auto transition error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to transition roles." } };
    }
  }
};
