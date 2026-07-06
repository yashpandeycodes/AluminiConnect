import { recommendationRepository } from "@/repositories/recommendationRepository";
import { careerStateRepository } from "@/repositories/careerStateRepository";
import { goalRepository } from "@/repositories/goalRepository";
import { careerInsightService } from "@/services/careerInsightService";
import { aiOrchestrationService } from "@/services/aiOrchestrationService";
import { recommendationResourceResolver } from "@/services/recommendationResourceResolver";
import { CareerRecommendation, Prisma } from "@prisma/client";
import { RankedRecommendation, AIRecommendationOutput } from "@/types/recommendation";
import { Result } from "@/types";

export const recommendationService = {
  async generateRecommendationSet(userId: string): Promise<Result<RankedRecommendation[]>> {
    try {
      // 1. Check Dependencies
      const state = await careerStateRepository.getByUserId(userId);
      if (!state) return { success: false, error: { code: "CONFLICT", message: "Career State missing." } };

      const goal = await goalRepository.getActiveGoal(userId);
      if (!goal) return { success: false, error: { code: "CONFLICT", message: "Career Goal missing." } };

      const insightResult = await careerInsightService.computeInsights(userId);
      if (!insightResult.success || !insightResult.data) {
        return { success: false, error: { code: "CONFLICT", message: "Career Insight unavailable." } };
      }

      // 2. Fetch AI Recommendations
      const aiResult = await aiOrchestrationService.generateRecommendations(state, insightResult.data, goal);
      if (!aiResult.success || !aiResult.data) {
        return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate AI recommendations." } };
      }

      // 3. Expire previous ACTIVE recommendations
      await recommendationRepository.expireCurrent(userId);

      // 4. Resolve URLs and map to Prisma Input
      const recommendations: AIRecommendationOutput[] = aiResult.data;
      const createData: Prisma.CareerRecommendationCreateManyInput[] = recommendations.map(rec => ({
        userId,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        reasoning: rec.reasoning,
        actionableStep: rec.actionableStep,
        estimatedHours: rec.estimatedHours,
        priorityScore: rec.priorityScore,
        impactScore: rec.impactScore,
        confidenceScore: rec.confidenceScore,
        resourceUrl: recommendationResourceResolver.resolveUrl(rec.resourceSearchKeywords),
        status: "ACTIVE",
        generatedByAI: true,
        careerStateVersion: state.schemaVersion,
        goalId: goal.id
      }));

      // 5. Save New Recommendations
      await recommendationRepository.createMany(createData);

      // 6. Return the newly active set (ranked)
      return this.listActiveRecommendations(userId);
    } catch (error) {
      console.error("generateRecommendationSet error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error." } };
    }
  },

  async listActiveRecommendations(userId: string): Promise<Result<RankedRecommendation[]>> {
    try {
      const active = await recommendationRepository.getActive(userId);
      
      const ranked: RankedRecommendation[] = active.map(rec => {
        const finalRankingScore = (0.5 * rec.priorityScore) + (0.3 * rec.impactScore) + (0.2 * rec.confidenceScore);
        return { ...rec, finalRankingScore };
      });

      // Sort descending by finalRankingScore
      ranked.sort((a, b) => b.finalRankingScore - a.finalRankingScore);

      return { success: true, data: ranked };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list active recommendations." } };
    }
  },

  async getRecommendationHistory(userId: string): Promise<Result<CareerRecommendation[]>> {
    try {
      const history = await recommendationRepository.getHistory(userId);
      return { success: true, data: history };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch recommendation history." } };
    }
  },

  async completeRecommendation(userId: string, id: string): Promise<Result<CareerRecommendation>> {
    try {
      const rec = await recommendationRepository.markCompleted(userId, id);
      return { success: true, data: rec };
    } catch (error) {
      return { success: false, error: { code: "NOT_FOUND", message: "Recommendation not found or unauthorized." } };
    }
  },

  async dismissRecommendation(userId: string, id: string): Promise<Result<CareerRecommendation>> {
    try {
      const rec = await recommendationRepository.dismiss(userId, id);
      return { success: true, data: rec };
    } catch (error) {
      return { success: false, error: { code: "NOT_FOUND", message: "Recommendation not found or unauthorized." } };
    }
  }
};
