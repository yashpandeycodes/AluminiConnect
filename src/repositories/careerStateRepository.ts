import { prisma } from "@/lib/prisma";
import { CareerState, CareerStateSyncStatus, CareerStateAnalysisSource, Prisma } from "@prisma/client";

export const careerStateRepository = {
  async getByUserId(userId: string): Promise<CareerState | null> {
    return prisma.careerState.findUnique({
      where: { userId }
    });
  },

  async upsertCareerState(
    userId: string,
    data: Prisma.CareerStateUpdateInput,
    createData: Prisma.CareerStateCreateInput
  ): Promise<CareerState> {
    return prisma.careerState.upsert({
      where: { userId },
      update: data,
      create: createData,
    });
  },

  async markSyncing(userId: string, source: CareerStateAnalysisSource): Promise<CareerState> {
    return prisma.careerState.upsert({
      where: { userId },
      update: {
        syncStatus: CareerStateSyncStatus.SYNCING,
        analysisSource: source
      },
      create: {
        user: { connect: { id: userId } },
        syncStatus: CareerStateSyncStatus.SYNCING,
        analysisSource: source,
        intelligence: {},
      }
    });
  },
  
  async markFailed(userId: string): Promise<CareerState> {
    return prisma.careerState.update({
      where: { userId },
      data: {
        syncStatus: CareerStateSyncStatus.FAILED
      }
    });
  }
};
