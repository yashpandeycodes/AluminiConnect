import { prisma } from "@/lib/prisma";
import { PREDICTION_VERSION } from "@/constants/predictionWeights";
import { CareerPrediction } from "@prisma/client";
import { CareerPredictionDTO, HistoricalPrediction } from "@/types/prediction";

export const predictionRepository = {
  async getByUserId(userId: string): Promise<CareerPrediction | null> {
    return prisma.careerPrediction.findUnique({
      where: { userId }
    });
  },

  async upsertPrediction(
    userId: string,
    currentPrediction: CareerPredictionDTO,
    newHistoricalPrediction: HistoricalPrediction
  ): Promise<CareerPrediction> {
    const existing = await this.getByUserId(userId);
    let predictionHistory: HistoricalPrediction[] = [];

    if (existing && existing.predictionHistory) {
      predictionHistory = existing.predictionHistory as unknown as HistoricalPrediction[];
    }
    
    predictionHistory.push(newHistoricalPrediction);

    // Limit retained history to latest 365 records
    if (predictionHistory.length > 365) {
      predictionHistory = predictionHistory.slice(-365);
    }

    return prisma.careerPrediction.upsert({
      where: { userId },
      create: {
        userId,
        currentPrediction: currentPrediction as any,
        predictionHistory: predictionHistory as any,
        predictionVersion: PREDICTION_VERSION.version
      },
      update: {
        currentPrediction: currentPrediction as any,
        predictionHistory: predictionHistory as any,
        predictionVersion: PREDICTION_VERSION.version,
        generatedAt: new Date()
      }
    });
  }
};
