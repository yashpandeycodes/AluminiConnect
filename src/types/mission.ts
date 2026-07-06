export interface AIMissionOutput {
  title: string;
  description: string;
  objective: string;
  estimatedHours: number;
  priorityScore: number;
  impactScore: number;
  difficultyScore: number;
  reasoning: string;
}

export interface AIMissionPlan {
  summary: string;
  missions: AIMissionOutput[];
}
