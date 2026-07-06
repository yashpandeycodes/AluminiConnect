import { CareerRecommendation } from "@prisma/client";

export interface AIRecommendationOutput {
  category: "LEARNING" | "PROJECT" | "CERTIFICATION" | "JOB" | "REFERRAL" | "NETWORKING" | "COMPETITION" | "OPEN_SOURCE";
  title: string;
  description: string;
  reasoning: string;
  actionableStep: string;
  estimatedHours: number | null;
  priorityScore: number;
  impactScore: number;
  confidenceScore: number;
  resourceSearchKeywords: string;
}

export interface RankedRecommendation extends CareerRecommendation {
  finalRankingScore: number;
}
