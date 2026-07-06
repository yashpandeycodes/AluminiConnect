import { missionRepository } from "@/repositories/missionRepository";
import { careerStateRepository } from "@/repositories/careerStateRepository";
import { goalRepository } from "@/repositories/goalRepository";
import { careerInsightService } from "@/services/careerInsightService";
import { recommendationService } from "@/services/recommendationService";
import { aiOrchestrationService } from "@/services/aiOrchestrationService";
import { CareerMission, Prisma } from "@prisma/client";
import { Result } from "@/types";

export const missionService = {
  async generateMissionPlan(userId: string): Promise<Result<CareerMission[]>> {
    try {
      // 1. Fetch Dependencies
      const state = await careerStateRepository.getByUserId(userId);
      if (!state) return { success: false, error: { code: "CONFLICT", message: "Career State missing." } };

      const goal = await goalRepository.getActiveGoal(userId);
      if (!goal) return { success: false, error: { code: "CONFLICT", message: "Career Goal missing." } };

      const insightResult = await careerInsightService.computeInsights(userId);
      if (!insightResult.success || !insightResult.data) {
        return { success: false, error: { code: "CONFLICT", message: "Career Insight unavailable." } };
      }

      const recResult = await recommendationService.listActiveRecommendations(userId);
      if (!recResult.success || !recResult.data || recResult.data.length === 0) {
        return { success: false, error: { code: "CONFLICT", message: "Active Recommendations missing." } };
      }

      // 2. AI Generation
      const aiResult = await aiOrchestrationService.generateMissions(state, goal, insightResult.data, recResult.data);
      if (!aiResult.success || !aiResult.data) {
        return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate AI missions." } };
      }

      // 3. Score and Sort
      const missions = aiResult.data.missions.map(m => {
        const executionScore = (0.45 * m.impactScore) + (0.35 * m.priorityScore) + (0.20 * (100 - m.difficultyScore));
        return { ...m, executionScore };
      });
      missions.sort((a, b) => b.executionScore - a.executionScore);

      // 4 & 5. Expire previous and save new inside a single Prisma transaction
      const createData: Prisma.CareerMissionCreateManyInput[] = missions.map((m, index) => {
        // Map 0-100 execution score to priority enum
        let priority: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
        if (m.executionScore >= 75) priority = "HIGH";
        else if (m.executionScore < 40) priority = "LOW";

        return {
          userId,
          title: m.title,
          description: m.description,
          objective: m.objective,
          estimatedHours: m.estimatedHours,
          priority,
          orderIndex: index,
          metadata: {
            reasoning: m.reasoning,
            priorityScore: m.priorityScore,
            impactScore: m.impactScore,
            difficultyScore: m.difficultyScore,
            executionScore: m.executionScore
          }
        };
      });

      await missionRepository.replaceActiveMissions(userId, createData);

      // 6. Return new active missions
      return this.listActiveMissions(userId);
    } catch (error) {
      console.error("generateMissionPlan error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error." } };
    }
  },

  async listActiveMissions(userId: string): Promise<Result<CareerMission[]>> {
    try {
      const active = await missionRepository.getActive(userId);
      return { success: true, data: active };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list active missions." } };
    }
  },

  async getMissionHistory(userId: string): Promise<Result<CareerMission[]>> {
    try {
      const history = await missionRepository.getHistory(userId);
      return { success: true, data: history };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch mission history." } };
    }
  },

  async completeMission(userId: string, id: string): Promise<Result<CareerMission>> {
    try {
      const rec = await missionRepository.markCompleted(userId, id);
      return { success: true, data: rec };
    } catch (error) {
      return { success: false, error: { code: "NOT_FOUND", message: "Mission not found or unauthorized." } };
    }
  },

  async cancelMission(userId: string, id: string): Promise<Result<CareerMission>> {
    try {
      const rec = await missionRepository.cancelMission(userId, id);
      return { success: true, data: rec };
    } catch (error) {
      return { success: false, error: { code: "NOT_FOUND", message: "Mission not found or unauthorized." } };
    }
  }
};
