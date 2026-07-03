import { prisma } from "@/lib/prisma";

export const contributionRepository = {
  async addContribution(userId: string, points: number, reason: string) {
    // Execute as a transaction so that we increment the score and log it atomically
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          contributionScore: {
            increment: points,
          },
        },
      });

      const log = await tx.contributionLog.create({
        data: {
          userId,
          points,
          reason,
        },
      });

      return { user, log };
    });
  },

  async getLeaderboard(limit: number = 100) {
    return await prisma.user.findMany({
      where: {
        role: "ALUMNI", // typically we only care about ranking alumni, but adjust if needed
        contributionScore: {
          gt: 0,
        },
      },
      select: {
        id: true,
        collegeEmail: true,
        contributionScore: true,
        alumniProfile: {
          select: {
            company: true,
            jobRole: true,
          }
        }
      },
      orderBy: {
        contributionScore: "desc",
      },
      take: limit,
    });
  },

  async getUserContributions(userId: string) {
    return await prisma.contributionLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },
};
