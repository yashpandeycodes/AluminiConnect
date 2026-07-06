import { goalRepository } from "@/repositories/goalRepository";
import { careerStateRepository } from "@/repositories/careerStateRepository";
import { aiOrchestrationService } from "@/services/aiOrchestrationService";
import { GoalSnapshotDTO } from "@/types/goal";
import { Result } from "@/types";
import { Prisma, CareerGoal } from "@prisma/client";

export const goalService = {
  async createGoal(userId: string, data: any): Promise<Result<CareerGoal>> {
    try {
      if (data.status === "ACTIVE") {
        await goalRepository.archiveAllActive(userId);
      }
      const goal = await goalRepository.createGoal({ ...data, userId });
      return { success: true, data: goal };
    } catch (error) {
      console.error("createGoal error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create goal." } };
    }
  },

  async updateGoal(userId: string, id: string, data: any): Promise<Result<CareerGoal>> {
    try {
      const existing = await goalRepository.getGoalById(id);
      if (!existing) return { success: false, error: { code: "NOT_FOUND", message: "Goal not found." } };
      if (existing.userId !== userId) return { success: false, error: { code: "UNAUTHORIZED", message: "User does not own goal." } };

      if (data.status === "ACTIVE" && existing.status !== "ACTIVE") {
        await goalRepository.archiveAllActive(userId);
      }
      const goal = await goalRepository.updateGoal(id, data);
      return { success: true, data: goal };
    } catch (error) {
      console.error("updateGoal error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update goal." } };
    }
  },

  async deleteGoal(userId: string, id: string): Promise<Result<CareerGoal>> {
    return this.archiveGoal(userId, id); // By requirement deleteGoal should Archive Goal
  },

  async archiveGoal(userId: string, id: string): Promise<Result<CareerGoal>> {
    try {
      const existing = await goalRepository.getGoalById(id);
      if (!existing) return { success: false, error: { code: "NOT_FOUND", message: "Goal not found." } };
      if (existing.userId !== userId) return { success: false, error: { code: "UNAUTHORIZED", message: "User does not own goal." } };

      const goal = await goalRepository.archiveGoal(id);
      return { success: true, data: goal };
    } catch (error) {
      console.error("archiveGoal error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to archive goal." } };
    }
  },

  async activateGoal(userId: string, id: string): Promise<Result<CareerGoal>> {
    return this.updateGoal(userId, id, { status: "ACTIVE" });
  },

  async listGoals(userId: string): Promise<Result<CareerGoal[]>> {
    try {
      const goals = await goalRepository.getGoalsByUser(userId);
      return { success: true, data: goals };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list goals." } };
    }
  },

  async fetchActiveGoal(userId: string): Promise<Result<CareerGoal>> {
    try {
      const goal = await goalRepository.getActiveGoal(userId);
      if (!goal) return { success: false, error: { code: "NOT_FOUND", message: "No active goal found." } };
      return { success: true, data: goal };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch active goal." } };
    }
  },

  async generateGoalSnapshot(userId: string): Promise<Result<GoalSnapshotDTO>> {
    try {
      const goal = await goalRepository.getActiveGoal(userId);
      if (!goal) return { success: false, error: { code: "NOT_FOUND", message: "No active goal found." } };

      const state = await careerStateRepository.getByUserId(userId);
      if (!state) return { success: false, error: { code: "NOT_FOUND", message: "Career state not found." } };

      const aiResult = await aiOrchestrationService.evaluateGoalAlignment(state, goal);
      if (!aiResult.success || !aiResult.data) {
        return { success: false, error: { code: "INTERNAL_ERROR", message: "AI evaluation failed." } };
      }

      let timeRemaining = null;
      let timeProgress = 0;
      if (goal.deadline) {
        const diffMs = goal.deadline.getTime() - new Date().getTime();
        timeRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        // Assuming max realistic timeline is 365 days, clamp for progress calc
        const maxDays = 365;
        timeProgress = Math.max(0, Math.min(100, 100 - (timeRemaining / maxDays) * 100));
      }

      const overallProgress = Math.min(100, Math.max(0, (state.readinessScore * 0.7) + (timeProgress * 0.3)));

      const snapshot: GoalSnapshotDTO = {
        goal,
        goalHealth: aiResult.data.goalHealth ?? 0,
        matchedSkills: aiResult.data.matchedSkills ?? [],
        missingSkills: aiResult.data.missingSkills ?? [],
        overallProgress,
        timeRemaining,
        careerStateVersion: state.schemaVersion,
        generatedAt: new Date().toISOString()
      };

      return { success: true, data: snapshot };
    } catch (error) {
      console.error("generateGoalSnapshot error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate snapshot." } };
    }
  }
};
