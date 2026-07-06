import { z } from "zod";

export type InsightCategory = "ALERT" | "OPPORTUNITY" | "FOCUS" | "MOMENTUM";
export type InsightGenerator = "RULE" | "AI" | "HYBRID";

export interface ActionableInsight {
  category: InsightCategory;
  priorityScore: number;
  impactScore: number;
  title: string;
  description: string;
  actionableStep?: string;
  reasoning: string;
  generatedBy: InsightGenerator;
}

export interface CareerInsightDTO {
  generatedAt: string;
  careerStateVersion: number;
  analysisModel: string | null;
  totalInsights: number;
  insights: ActionableInsight[];
}
