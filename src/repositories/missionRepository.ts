import { prisma } from "@/lib/prisma";
import { CareerMission, Prisma, MissionStatus } from "@prisma/client";

export const missionRepository = {
  async replaceActiveMissions(userId: string, data: Prisma.CareerMissionCreateManyInput[]): Promise<void> {
    await prisma.$transaction([
      prisma.careerMission.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "EXPIRED" }
      }),
      prisma.careerMission.createMany({ data })
    ]);
  },

  async getActive(userId: string): Promise<CareerMission[]> {
    return prisma.careerMission.findMany({
      where: { userId, status: "ACTIVE" },
      orderBy: { orderIndex: "asc" }
    });
  },

  async getHistory(userId: string): Promise<CareerMission[]> {
    return prisma.careerMission.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  },

  async markCompleted(userId: string, id: string): Promise<CareerMission> {
    return prisma.careerMission.update({
      where: { id, userId },
      data: { status: "COMPLETED" }
    });
  },

  async cancelMission(userId: string, id: string): Promise<CareerMission> {
    return prisma.careerMission.update({
      where: { id, userId },
      data: { status: "CANCELLED" }
    });
  }
};
