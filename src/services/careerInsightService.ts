import { careerStateRepository } from "@/repositories/careerStateRepository";
import { ActionableInsight, CareerInsightDTO } from "@/types/careerInsight";
import { Result } from "@/types";

export const careerInsightService = {
  async computeInsights(userId: string): Promise<Result<CareerInsightDTO>> {
    try {
      const state = await careerStateRepository.getByUserId(userId);
      if (!state || state.syncStatus === "FAILED") {
        return { success: false, error: { code: "NOT_FOUND", message: "Career state not found or failed. Please rebuild first." } };
      }
      if (state.syncStatus === "SYNCING") {
        return { success: false, error: { code: "UNAVAILABLE", message: "Career state is currently syncing." } };
      }

      const insights: ActionableInsight[] = [];
      const intelligence: any = state.intelligence || {};

      // Deterministic Pipeline
      
      // Rule 1: Resume Freshness
      const daysSinceLastUpdate = Math.floor((new Date().getTime() - new Date(state.lastAnalyzedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastUpdate > 90) {
        insights.push({
          category: "ALERT",
          priorityScore: 85,
          impactScore: 70,
          title: "Resume is Getting Stale",
          description: "Your resume hasn't been updated in over 3 months. Keeping it fresh ensures better alignment with opportunities.",
          actionableStep: "Upload a newer version of your resume.",
          reasoning: "Rule triggered because lastAnalyzedAt > 90 days.",
          generatedBy: "RULE"
        });
      }

      // Fast Mapping Pipeline (Replaces expensive real-time LLM calls)
      if (intelligence.weaknesses && Array.isArray(intelligence.weaknesses) && intelligence.weaknesses.length > 0) {
        insights.push({
          category: "ALERT",
          priorityScore: 90,
          impactScore: 80,
          title: "Primary Skill Gap Detected",
          description: `Your profile indicates a weakness in: ${intelligence.weaknesses[0]}.`,
          actionableStep: "Focus your upcoming missions on bridging this gap.",
          reasoning: "Derived from structural AI intelligence.",
          generatedBy: "HYBRID"
        });
      }

      if (intelligence.strengths && Array.isArray(intelligence.strengths) && intelligence.strengths.length > 0) {
        insights.push({
          category: "MOMENTUM",
          priorityScore: 75,
          impactScore: 60,
          title: "Leverage Your Strengths",
          description: `You have strong momentum with: ${intelligence.strengths[0]}.`,
          actionableStep: "Highlight this in your next resume revision.",
          reasoning: "Derived from structural AI intelligence.",
          generatedBy: "HYBRID"
        });
      }
      
      if (intelligence.learningPriorities && Array.isArray(intelligence.learningPriorities) && intelligence.learningPriorities.length > 0) {
        insights.push({
          category: "OPPORTUNITY",
          priorityScore: 80,
          impactScore: 70,
          title: "High ROI Learning Target",
          description: `Consider learning: ${intelligence.learningPriorities[0]}.`,
          actionableStep: "Set a goal to master this technology.",
          reasoning: "Derived from structural AI intelligence.",
          generatedBy: "HYBRID"
        });
      }

      // Sort by priority + impact
      insights.sort((a, b) => (b.priorityScore + b.impactScore) - (a.priorityScore + a.impactScore));

      const dto: CareerInsightDTO = {
        generatedAt: new Date().toISOString(),
        careerStateVersion: state.schemaVersion,
        analysisModel: state.analysisModel,
        totalInsights: insights.length,
        insights,
      };

      return { success: true, data: dto };
    } catch (error) {
      console.error("Compute insights error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to compute career insights." } };
    }
  }
};
