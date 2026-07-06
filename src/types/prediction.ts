export interface CareerPredictionDTO {
  goalAchievementProbability: number;
  placementReadinessForecast: number;
  predictedCompletionDate: string | null;
  velocityScore: number;
  confidenceScore: number;
  burnoutForecast: "LOW" | "MEDIUM" | "HIGH";
  delayRisk: "LOW" | "MEDIUM" | "HIGH";
  productivityTrend: "IMPROVING" | "STABLE" | "DECLINING";
  simulations: {
    weeklyHours: number;
    predictedCompletionDate: string | null;
    goalProbability: number;
  }[];
  generatedAt: string;
}

export interface HistoricalPrediction {
  date: string;
  goalProbability: number;
  placementForecast: number;
  velocity: number;
  delayRisk: "LOW" | "MEDIUM" | "HIGH";
}
