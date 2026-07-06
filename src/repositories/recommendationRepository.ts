import { prisma } from "@/lib/prisma";
import { CareerRecommendation, Prisma, RecommendationStatus } from "@prisma/client";

export const recommendationRepository = {
  async createMany(data: Prisma.CareerRecommendationCreateManyInput[]): Promise<void> {
    await prisma.careerRecommendation.createMany({ data });
  },

  async expireCurrent(userId: string): Promise<void> {
    await prisma.careerRecommendation.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "EXPIRED" }
    });
  },

  async getActive(userId: string): Promise<CareerRecommendation[]> {
    return prisma.careerRecommendation.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" }
    });
  },

  async getHistory(userId: string): Promise<CareerRecommendation[]> {
    return prisma.careerRecommendation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  },

  async markCompleted(userId: string, id: string): Promise<CareerRecommendation> {
    return prisma.careerRecommendation.update({
      where: { id, userId },
      data: { status: "COMPLETED" }
    });
  },

  async dismiss(userId: string, id: string): Promise<CareerRecommendation> {
    return prisma.careerRecommendation.update({
      where: { id, userId },
      data: { status: "DISMISSED" }
    });
  }
};
