export interface CareerAnalyticsDTO {
  overallProgress: number;
  goalAchievementConfidence: number;
  missionCompletion: number;
  recommendationCompletion: number;
  weeklyConsistency: number;
  activeStreak: number;
  estimatedCompletionDate: string | null;
  scheduleRisk: "LOW" | "MEDIUM" | "HIGH";
  burnoutRisk: "LOW" | "MEDIUM" | "HIGH";
  generatedAt: string;
  
  // Prediction Inputs
  averageWeeklyVelocity: number;
  averageCompletionTime: number;
  averageMissionDifficultyCompleted: number;
  averageHoursPerWeek: number;
}

export interface HistoricalMetric {
  date: string;
  overallProgress: number;
  missionCompletion: number;
  recommendationCompletion: number;
  goalConfidence: number;
}
