import { prisma } from "@/lib/prisma";
import { Result } from "@/types";
import { User } from "@prisma/client";

export const adminService = {
  async getPlatformStats(): Promise<Result<{ students: number; alumni: number; opportunities: number; referrals: number }>> {
    try {
      const [students, alumni, opportunities, referrals] = await prisma.$transaction([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "ALUMNI" } }),
        prisma.opportunity.count(),
        prisma.referral.count()
      ]);

      return { success: true, data: { students, alumni, opportunities, referrals } };
    } catch (error) {
      console.error("Get platform stats error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch platform stats." } };
    }
  },

  async getAllUsers(): Promise<Result<Partial<User>[]>> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          collegeEmail: true,
          role: true,
          graduationYear: true,
          isBanned: true,
          createdAt: true,
          contributionScore: true,
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      return { success: true, data: users as Partial<User>[] };
    } catch (error) {
      console.error("Get all users error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch users." } };
    }
  },

  async toggleUserBan(userId: string, isBanned: boolean): Promise<Result<{ success: boolean }>> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned }
      });
      return { success: true, data: { success: true } };
    } catch (error) {
      console.error("Toggle user ban error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to toggle user ban status." } };
    }
  }
};
