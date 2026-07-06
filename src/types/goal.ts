import { CareerGoal, GoalPriority, GoalStatus } from "@prisma/client";

export interface GoalSnapshotDTO {
  goal: CareerGoal;
  goalHealth: number;
  matchedSkills: string[];
  missingSkills: string[];
  overallProgress: number;
  timeRemaining: number | null;
  careerStateVersion: number | null;
  generatedAt: string;
}
