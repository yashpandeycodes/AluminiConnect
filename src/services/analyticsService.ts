import { analyticsRepository } from "@/repositories/analyticsRepository";
import { careerStateRepository } from "@/repositories/careerStateRepository";
import { goalRepository } from "@/repositories/goalRepository";
import { recommendationRepository } from "@/repositories/recommendationRepository";
import { missionRepository } from "@/repositories/missionRepository";
import { timelineRepository } from "@/repositories/timelineRepository";
import { CareerAnalyticsDTO, HistoricalMetric } from "@/types/analytics";
import { Result } from "@/types";
import { ANALYTICS_WEIGHTS } from "@/lib/config/analyticsWeights";

export const analyticsService = {
  async computeAnalytics(userId: string): Promise<Result<CareerAnalyticsDTO>> {
    try {
      // 1. Fetch Dependencies
      const state = await careerStateRepository.getByUserId(userId);
      const goal = await goalRepository.getActiveGoal(userId);
      const recommendations = await recommendationRepository.getHistory(userId);
      const missions = await missionRepository.getHistory(userId);
      const timeline = await timelineRepository.getActive(userId);

      // 2. Compute Base Metrics
      const readinessScore = state ? (state.readinessScore || 0) : 0;
      
      const totalRecs = recommendations.length;
      const completedRecs = recommendations.filter(r => r.status === "COMPLETED").length;
      const recCompletion = totalRecs > 0 ? (completedRecs / totalRecs) * 100 : 0;

      const totalMissions = missions.length;
      const completedMissions = missions.filter(m => m.status === "COMPLETED");
      const missionCompletion = totalMissions > 0 ? (completedMissions.length / totalMissions) * 100 : 0;

      const timelineHealth = timeline ? timeline.scheduleHealth : 100;
      const goalHealth = (readinessScore * 0.5) + (timelineHealth * 0.5);

      // 1. Overall Progress
      const overallProgress = 
        (ANALYTICS_WEIGHTS.OVERALL_PROGRESS.READINESS * readinessScore) + 
        (ANALYTICS_WEIGHTS.OVERALL_PROGRESS.MISSION * missionCompletion) + 
        (ANALYTICS_WEIGHTS.OVERALL_PROGRESS.RECOMMENDATION * recCompletion) + 
        (ANALYTICS_WEIGHTS.OVERALL_PROGRESS.GOAL_HEALTH * goalHealth);

      // 4. Active Streak (consecutive days of completed missions)
      let activeStreak = 0;
      if (completedMissions.length > 0) {
        const sortedCompletionDates = completedMissions
          .map(m => new Date(m.updatedAt))
          .sort((a, b) => b.getTime() - a.getTime());

        let currentDate = new Date();
        currentDate.setHours(0,0,0,0);
        
        for (let i = 0; i < sortedCompletionDates.length; i++) {
          const compDate = new Date(sortedCompletionDates[i]);
          compDate.setHours(0,0,0,0);
          
          const diffDays = Math.floor((currentDate.getTime() - compDate.getTime()) / (1000 * 3600 * 24));
          
          if (diffDays === 0 || diffDays === 1) {
            if (i === 0 || diffDays === 1) activeStreak++;
            currentDate = compDate;
          } else {
            break;
          }
        }
      }

      const weeklyConsistency = activeStreak > 0 ? 100 : 0;

      // 6. Estimated Completion Date
      let estimatedCompletionDate: Date | null = null;
      const weeklyHours = timeline ? timeline.weeklyHours : 8;
      const activeMissions = missions.filter(m => m.status === "ACTIVE");
      const remainingHours = activeMissions.reduce((acc, m) => acc + m.estimatedHours, 0);

      if (remainingHours > 0) {
        const weeksNeeded = remainingHours / weeklyHours;
        estimatedCompletionDate = new Date();
        estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + (weeksNeeded * 7));
      }

      // 7. Schedule Risk
      let scheduleRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      if (timelineHealth < 50) scheduleRisk = "HIGH";
      else if (timelineHealth < 80) scheduleRisk = "MEDIUM";

      // 8. Burnout Risk
      let burnoutRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      if (weeklyHours > 40) burnoutRisk = "HIGH";
      else if (weeklyHours > 20) burnoutRisk = "MEDIUM";

      // 9. Goal Achievement Confidence
      const goalAchievementConfidence = 
        (ANALYTICS_WEIGHTS.GOAL_CONFIDENCE.READINESS * readinessScore) + 
        (ANALYTICS_WEIGHTS.GOAL_CONFIDENCE.MISSION * missionCompletion) + 
        (ANALYTICS_WEIGHTS.GOAL_CONFIDENCE.TIMELINE_HEALTH * timelineHealth) + 
        (ANALYTICS_WEIGHTS.GOAL_CONFIDENCE.GOAL_HEALTH * goalHealth);

      // 10. Prediction Inputs
      const averageHoursPerWeek = weeklyHours;
      const weeksActive = Math.max(1, activeStreak / 7);
      const averageWeeklyVelocity = completedMissions.length / weeksActive;
      
      const totalCompletionTimeHours = completedMissions.reduce((sum, m) => sum + m.estimatedHours, 0);
      const averageCompletionTime = completedMissions.length > 0 ? totalCompletionTimeHours / completedMissions.length : 0;
      
      const completedMissionsMeta = completedMissions.map(m => (m.metadata as any) || {});
      const totalDifficulty = completedMissionsMeta.reduce((sum, meta) => sum + (meta.difficultyScore || 50), 0);
      const averageMissionDifficultyCompleted = completedMissions.length > 0 ? totalDifficulty / completedMissions.length : 0;

      const dto: CareerAnalyticsDTO = {
        overallProgress: parseFloat(overallProgress.toFixed(2)),
        goalAchievementConfidence: parseFloat(goalAchievementConfidence.toFixed(2)),
        missionCompletion: parseFloat(missionCompletion.toFixed(2)),
        recommendationCompletion: parseFloat(recCompletion.toFixed(2)),
        weeklyConsistency,
        activeStreak,
        estimatedCompletionDate: estimatedCompletionDate ? estimatedCompletionDate.toISOString() : null,
        scheduleRisk,
        burnoutRisk,
        generatedAt: new Date().toISOString(),
        averageWeeklyVelocity: parseFloat(averageWeeklyVelocity.toFixed(2)),
        averageCompletionTime: parseFloat(averageCompletionTime.toFixed(2)),
        averageMissionDifficultyCompleted: parseFloat(averageMissionDifficultyCompleted.toFixed(2)),
        averageHoursPerWeek
      };

      const hist: HistoricalMetric = {
        date: new Date().toISOString(),
        overallProgress: dto.overallProgress,
        missionCompletion: dto.missionCompletion,
        recommendationCompletion: dto.recommendationCompletion,
        goalConfidence: dto.goalAchievementConfidence
      };

      await analyticsRepository.upsertAnalytics(userId, dto, hist);

      return { success: true, data: dto };
    } catch (error) {
      console.error("computeAnalytics error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to compute analytics." } };
    }
  },

  async getLatestAnalytics(userId: string): Promise<Result<CareerAnalyticsDTO>> {
    try {
      const analytics = await analyticsRepository.getByUserId(userId);
      if (!analytics) return { success: false, error: { code: "NOT_FOUND", message: "No analytics found." } };

      return { success: true, data: analytics.currentMetrics as unknown as CareerAnalyticsDTO };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch analytics." } };
    }
  }
};
