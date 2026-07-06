import { predictionRepository } from "@/repositories/predictionRepository";
import { analyticsRepository } from "@/repositories/analyticsRepository";
import { timelineRepository } from "@/repositories/timelineRepository";
import { missionRepository } from "@/repositories/missionRepository";
import { careerStateRepository } from "@/repositories/careerStateRepository";
import { PREDICTION_WEIGHTS } from "@/constants/predictionWeights";
import { CareerPredictionDTO, HistoricalPrediction } from "@/types/prediction";
import { Result } from "@/types";
import { HistoricalMetric } from "@/types/analytics";

export const predictionService = {
  async computePrediction(userId: string): Promise<Result<CareerPredictionDTO>> {
    try {
      // 1. Fetch Dependencies
      const analyticsRecord = await analyticsRepository.getByUserId(userId);
      const timeline = await timelineRepository.getActive(userId);
      const missions = await missionRepository.getHistory(userId);
      const state = await careerStateRepository.getByUserId(userId);

      if (!analyticsRecord || !analyticsRecord.currentMetrics) {
        return { success: false, error: { code: "NOT_FOUND", message: "Analytics data required to generate predictions." } };
      }

      const analytics = analyticsRecord.currentMetrics as any;
      const historicalAnalytics = (analyticsRecord.historicalMetrics as unknown as HistoricalMetric[]) || [];
      
      const weeklyHours = timeline ? timeline.weeklyHours : 8;
      const timelineHealth = timeline ? timeline.scheduleHealth : 100;
      const activeMissions = missions.filter(m => m.status === "ACTIVE");
      const remainingHours = activeMissions.reduce((acc, m) => acc + m.estimatedHours, 0);

      // 1. Goal Achievement Probability
      const baseProb = 
        (PREDICTION_WEIGHTS.GOAL_PROBABILITY.OVERALL_PROGRESS * (analytics.overallProgress || 0)) +
        (PREDICTION_WEIGHTS.GOAL_PROBABILITY.GOAL_HEALTH * (analytics.goalAchievementConfidence || 0)) +
        (PREDICTION_WEIGHTS.GOAL_PROBABILITY.TIMELINE_HEALTH * timelineHealth) +
        (PREDICTION_WEIGHTS.GOAL_PROBABILITY.WEEKLY_CONSISTENCY * (analytics.weeklyConsistency || 0)) +
        (PREDICTION_WEIGHTS.GOAL_PROBABILITY.MISSION_COMPLETION * (analytics.missionCompletion || 0));
        
      const bonus = Math.min(PREDICTION_WEIGHTS.GOAL_PROBABILITY.ACTIVE_STREAK_BONUS * 100, (analytics.activeStreak || 0) * 2);
      const goalAchievementProbability = Math.min(100, baseProb + bonus);

      // 2. Predicted Completion Date
      let predictedCompletionDate: Date | null = null;
      if (remainingHours > 0) {
        // Assume consistency impacts effective velocity directly
        const consistencyFactor = Math.max(10, (analytics.weeklyConsistency || 50)) / 100;
        const effectiveWeeklyHours = weeklyHours * consistencyFactor;
        const weeksRequired = remainingHours / effectiveWeeklyHours;
        predictedCompletionDate = new Date();
        predictedCompletionDate.setDate(predictedCompletionDate.getDate() + (weeksRequired * 7));
      }

      // 3. Placement Readiness Forecast
      const placementReadinessForecast = Math.min(100,
        (PREDICTION_WEIGHTS.PLACEMENT_READINESS.READINESS_SCORE * (state?.readinessScore || 0)) +
        (PREDICTION_WEIGHTS.PLACEMENT_READINESS.GOAL_ALIGNMENT * (analytics.goalAchievementConfidence || 0)) +
        (PREDICTION_WEIGHTS.PLACEMENT_READINESS.MISSION_COMPLETION * (analytics.missionCompletion || 0)) +
        (PREDICTION_WEIGHTS.PLACEMENT_READINESS.RECOMMENDATION_COMPLETION * (analytics.recommendationCompletion || 0))
      );

      // 4. Burnout Forecast
      let burnoutForecast: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      if (weeklyHours > 40 || (weeklyHours > 30 && (analytics.weeklyConsistency || 0) < 50)) {
        burnoutForecast = "HIGH";
      } else if (weeklyHours > 20) {
        burnoutForecast = "MEDIUM";
      }

      // 5. Delay Risk
      let delayRisk: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      if (analytics.scheduleRisk === "HIGH" || timelineHealth < 40) delayRisk = "HIGH";
      else if (analytics.scheduleRisk === "MEDIUM" || timelineHealth < 75) delayRisk = "MEDIUM";

      // 6. Productivity Trend
      let productivityTrend: "IMPROVING" | "STABLE" | "DECLINING" = "STABLE";
      if (historicalAnalytics.length >= 2) {
        const latest = historicalAnalytics[historicalAnalytics.length - 1];
        const previous = historicalAnalytics[historicalAnalytics.length - 2];
        if (latest.overallProgress > previous.overallProgress + 2) productivityTrend = "IMPROVING";
        else if (latest.overallProgress < previous.overallProgress - 2) productivityTrend = "DECLINING";
      }

      // 7. Velocity Score
      const velocityScore = Math.min(100, 
        (PREDICTION_WEIGHTS.VELOCITY.MISSION_VELOCITY * Math.min(100, (analytics.averageWeeklyVelocity || 0) * 10)) +
        (PREDICTION_WEIGHTS.VELOCITY.RECOMMENDATION_VELOCITY * (analytics.recommendationCompletion || 0)) +
        (PREDICTION_WEIGHTS.VELOCITY.WEEKLY_CONSISTENCY * (analytics.weeklyConsistency || 0))
      );

      // 8. Confidence Score
      // Confidence grows with historical data volume (e.g., 30 data points = 100% confidence)
      const confidenceScore = Math.min(100, (historicalAnalytics.length / 30) * 100);

      // 9. Intervention Simulator
      const simulations = [10, 15, 20].map(h => {
        let simDate: Date | null = null;
        if (remainingHours > 0) {
           const simWeeksRequired = remainingHours / h;
           simDate = new Date();
           simDate.setDate(simDate.getDate() + (simWeeksRequired * 7));
        }
        
        // Predict probability jump (rough deterministic heuristic)
        const hourDelta = h - weeklyHours;
        const simProb = Math.min(100, Math.max(0, goalAchievementProbability + (hourDelta * 1.5)));
        
        return {
          weeklyHours: h,
          predictedCompletionDate: simDate ? simDate.toISOString() : null,
          goalProbability: parseFloat(simProb.toFixed(2))
        };
      });

      const dto: CareerPredictionDTO = {
        goalAchievementProbability: parseFloat(goalAchievementProbability.toFixed(2)),
        placementReadinessForecast: parseFloat(placementReadinessForecast.toFixed(2)),
        predictedCompletionDate: predictedCompletionDate ? predictedCompletionDate.toISOString() : null,
        velocityScore: parseFloat(velocityScore.toFixed(2)),
        confidenceScore: parseFloat(confidenceScore.toFixed(2)),
        burnoutForecast,
        delayRisk,
        productivityTrend,
        simulations,
        generatedAt: new Date().toISOString()
      };

      const hist: HistoricalPrediction = {
        date: new Date().toISOString(),
        goalProbability: dto.goalAchievementProbability,
        placementForecast: dto.placementReadinessForecast,
        velocity: dto.velocityScore,
        delayRisk: dto.delayRisk
      };

      await predictionRepository.upsertPrediction(userId, dto, hist);

      return { success: true, data: dto };
    } catch (error) {
      console.error("computePrediction error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to compute predictions." } };
    }
  },

  async getLatestPrediction(userId: string): Promise<Result<CareerPredictionDTO>> {
    try {
      const prediction = await predictionRepository.getByUserId(userId);
      if (!prediction) return { success: false, error: { code: "NOT_FOUND", message: "No prediction found." } };

      return { success: true, data: prediction.currentPrediction as unknown as CareerPredictionDTO };
    } catch (error) {
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch prediction." } };
    }
  }
};
