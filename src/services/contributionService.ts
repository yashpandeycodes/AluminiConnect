import { contributionRepository } from "@/repositories/contributionRepository";
import { Result } from "@/types";
import { ContributionLog } from "@prisma/client";

export const contributionService = {
  async addContribution(userId: string, points: number, reason: string): Promise<Result<{ success: boolean }>> {
    try {
      if (points <= 0) {
        return { success: false, error: { code: "INVALID_REQUEST", message: "Points must be positive." } };
      }
      if (!reason) {
        return { success: false, error: { code: "INVALID_REQUEST", message: "Reason must be provided." } };
      }

      await contributionRepository.addContribution(userId, points, reason);
      
      return { success: true, data: { success: true } };
    } catch (error) {
      console.error("Add contribution error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to add contribution." } };
    }
  },

  async getLeaderboard(limit: number = 100): Promise<Result<unknown[]>> {
    try {
      const leaderboard = await contributionRepository.getLeaderboard(limit);
      return { success: true, data: leaderboard };
    } catch (error) {
      console.error("Get leaderboard error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to get leaderboard." } };
    }
  },

  async getMyContributions(userId: string): Promise<Result<ContributionLog[]>> {
    try {
      const logs = await contributionRepository.getUserContributions(userId);
      return { success: true, data: logs };
    } catch (error) {
      console.error("Get my contributions error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch contribution logs." } };
    }
  }
};
