import { prisma } from "@/lib/prisma";
import { CareerTimeline, Prisma, TimelineStatus } from "@prisma/client";

export const timelineRepository = {
  async replaceTimeline(userId: string, data: Prisma.CareerTimelineUncheckedCreateInput): Promise<CareerTimeline> {
    const [, newTimeline] = await prisma.$transaction([
      prisma.careerTimeline.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "ARCHIVED" }
      }),
      prisma.careerTimeline.create({ data })
    ]);
    return newTimeline;
  },

  async getActive(userId: string): Promise<CareerTimeline | null> {
    return prisma.careerTimeline.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" }
    });
  }
};
