import { timelineRepository } from "@/repositories/timelineRepository";
import { missionRepository } from "@/repositories/missionRepository";
import { goalRepository } from "@/repositories/goalRepository";
import { timelineScheduler } from "@/utils/timelineScheduler";
import { CareerTimeline, Prisma } from "@prisma/client";
import { Result } from "@/types";

export const timelineService = {
  async generateTimeline(userId: string, requestedWeeklyHours?: number): Promise<Result<CareerTimeline>> {
    try {
      // 1. Fetch Dependencies
      const missions = await missionRepository.getHistory(userId);
      const activeMissions = missions.filter(m => m.status === "ACTIVE" || m.status === "COMPLETED"); // Schedule includes completed for stats

      if (activeMissions.length === 0) {
        return { success: false, error: { code: "CONFLICT", message: "No active missions found to schedule." } };
      }

      const goal = await goalRepository.getActiveGoal(userId);

      // Default to 8 hours/week if not specified
      const weeklyHours = requestedWeeklyHours || 8;

      // 2. Execute Deterministic Scheduler
      const scheduleResult = timelineScheduler.generateSchedule({
        missions: activeMissions.sort((a, b) => a.orderIndex - b.orderIndex), // ensure ordered
        goal,
        weeklyHours
      });

      // 3. Prepare Database Payload
      const createData: Prisma.CareerTimelineUncheckedCreateInput = {
        userId,
        timeline: scheduleResult.timeline as any,
        estimatedCompletionDate: scheduleResult.estimatedCompletionDate,
        totalEstimatedHours: scheduleResult.totalEstimatedHours,
        weeklyHours,
        scheduleHealth: scheduleResult.scheduleHealth,
        status: "ACTIVE"
      };

      // 4. Save Timeline via Transaction
      const newTimeline = await timelineRepository.replaceTimeline(userId, createData);

      return { success: true, data: newTimeline };
    } catch (error) {
      console.error("generateTimeline error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error." } };
    }
  },

  async getActiveTimeline(userId: string): Promise<Result<CareerTimeline>> {
    try {
      const timeline = await timelineRepository.getActive(userId);
      if (!timeline) {
        return { success: false, error: { code: "NOT_FOUND", message: "No active timeline found." } };
      }
      return { success: true, data: timeline };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch timeline." } };
    }
  }
};
