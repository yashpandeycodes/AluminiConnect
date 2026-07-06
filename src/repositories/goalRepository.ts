import { prisma } from "@/lib/prisma";
import { CareerGoal, GoalStatus, Prisma } from "@prisma/client";

export const goalRepository = {
  async createGoal(data: Prisma.CareerGoalUncheckedCreateInput): Promise<CareerGoal> {
    return prisma.careerGoal.create({ data });
  },

  async updateGoal(id: string, data: Prisma.CareerGoalUpdateInput): Promise<CareerGoal> {
    return prisma.careerGoal.update({ where: { id }, data });
  },

  async deleteGoal(id: string): Promise<CareerGoal> {
    return prisma.careerGoal.delete({ where: { id } });
  },

  async getGoalById(id: string): Promise<CareerGoal | null> {
    return prisma.careerGoal.findUnique({ where: { id } });
  },

  async getGoalsByUser(userId: string): Promise<CareerGoal[]> {
    return prisma.careerGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getActiveGoal(userId: string): Promise<CareerGoal | null> {
    return prisma.careerGoal.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
  },

  async archiveGoal(id: string): Promise<CareerGoal> {
    return prisma.careerGoal.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  },
  
  async archiveAllActive(userId: string): Promise<void> {
    await prisma.careerGoal.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "ARCHIVED" }
    });
  }
};
