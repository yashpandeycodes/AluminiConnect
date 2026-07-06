import { generateJSON } from "@/lib/ai/gemini";
import { buildGoalEvaluationPrompt, buildRecommendationPrompt, buildMissionGenerationPrompt } from "@/lib/ai/prompts";
import { CareerGoal } from "@prisma/client";
import { Result } from "@/types";
import { AIMissionPlan } from "@/types/mission";

export const aiOrchestrationService = {
  async evaluateGoalAlignment(careerState: any, careerGoal: CareerGoal): Promise<Result<any>> {
    try {
      if (!careerState || !careerGoal) {
         return { success: false, error: { code: "INVALID_REQUEST", message: "Career state and goal are required." } };
      }
      const prompt = buildGoalEvaluationPrompt(careerState, careerGoal);
      const data = await generateJSON<any>(prompt);
      return { success: true, data };
    } catch (error) {
      console.error("evaluateGoalAlignment error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to evaluate goal alignment." } };
    }
  },

  async generateRecommendations(careerState: any, careerInsight: any, careerGoal: any): Promise<Result<any[]>> {
    try {
      if (!careerState || !careerInsight || !careerGoal) {
         return { success: false, error: { code: "INVALID_REQUEST", message: "Missing dependencies." } };
      }
      const prompt = buildRecommendationPrompt(careerState, careerInsight, careerGoal);
      const data = await generateJSON<any[]>(prompt);
      return { success: true, data };
    } catch (error) {
      console.error("generateRecommendations error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate recommendations." } };
    }
  },

  async generateMissions(careerState: any, careerGoal: any, careerInsight: any, recommendations: any): Promise<Result<AIMissionPlan>> {
    try {
      if (!careerState || !careerInsight || !careerGoal || !recommendations) {
         return { success: false, error: { code: "INVALID_REQUEST", message: "Missing dependencies." } };
      }
      const prompt = buildMissionGenerationPrompt(careerState, careerGoal, careerInsight, recommendations);
      const data = await generateJSON<AIMissionPlan>(prompt);
      return { success: true, data };
    } catch (error) {
      console.error("generateMissions error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate missions." } };
    }
  }
};
