import { prisma } from "@/lib/prisma";
import { ANALYTICS_VERSION } from "@/lib/config/analyticsWeights";
import { CareerAnalytics } from "@prisma/client";
import { CareerAnalyticsDTO, HistoricalMetric } from "@/types/analytics";

export const analyticsRepository = {
  async getByUserId(userId: string): Promise<CareerAnalytics | null> {
    return prisma.careerAnalytics.findUnique({
      where: { userId }
    });
  },

  async upsertAnalytics(
    userId: string,
    currentMetrics: CareerAnalyticsDTO,
    newHistoricalMetric: HistoricalMetric
  ): Promise<CareerAnalytics> {
    const existing = await this.getByUserId(userId);
    let historicalMetrics: HistoricalMetric[] = [];
    
    if (existing && existing.historicalMetrics) {
      historicalMetrics = existing.historicalMetrics as unknown as HistoricalMetric[];
    }
    historicalMetrics.push(newHistoricalMetric);
    
    // Cap at latest 365 snapshots
    if (historicalMetrics.length > 365) {
      historicalMetrics = historicalMetrics.slice(-365);
    }

    // Default configuration versions
    const analyticsVersion = ANALYTICS_VERSION.schemaVersion;
    const formulaVersion = ANALYTICS_VERSION.formulaVersion;

    return prisma.careerAnalytics.upsert({
      where: { userId },
      create: {
        userId,
        currentMetrics: currentMetrics as any,
        historicalMetrics: historicalMetrics as any,
        analyticsVersion,
        formulaVersion
      },
      update: {
        currentMetrics: currentMetrics as any,
        historicalMetrics: historicalMetrics as any,
        analyticsVersion,
        formulaVersion,
        generatedAt: new Date()
      }
    });
  }
};
