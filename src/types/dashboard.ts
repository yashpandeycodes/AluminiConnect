import { CareerState, CareerGoal, CareerMission } from "@prisma/client";
import { CareerAnalyticsDTO } from "./analytics";
import { CareerPredictionDTO } from "./prediction";
import { DynamicTimelineView, TimelineData } from "./timeline";

// Using any for simplified types that aren't strictly exported everywhere
export interface DashboardHero {
  studentName: string;
  targetRole: string;
  readinessScore: number;
  overallProgress: number;
  goalProbability: number;
  careerHealthIndicator: "EXCELLENT" | "GOOD" | "FAIR" | "AT_RISK";
  motivationalSummary: string;
}

export interface DashboardInsights {
  biggestWeakness: string | null;
  biggestOpportunity: string | null;
  weeklyFocus: string | null;
  momentum: string | null; // e.g. "High", "Low"
}

export interface DashboardDTO {
  hero: DashboardHero;
  insights: DashboardInsights | null;
  recommendations: any[]; // Maps to active recommendations
  missions: CareerMission[];
  timeline: DynamicTimelineView | null;
  analytics: CareerAnalyticsDTO | null;
  prediction: CareerPredictionDTO | null;
  goal: CareerGoal | null;
}
