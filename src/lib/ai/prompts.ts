export function buildAtsScorePrompt(resumeText: string, targetRole: string): string {
  return `You are an expert ATS (Applicant Tracking System) and technical recruiter. 
Evaluate the following resume against the target role.

Target Role: ${targetRole}

Resume Text:
${resumeText}

Provide an ATS compatibility score out of 100.
Identify the missing keywords from the resume that are crucial for this role.
Provide 3 actionable suggestions to improve the resume for this specific role.

Respond with ONLY valid JSON using this schema:
{
  "score": number,
  "missingKeywords": string[],
  "suggestions": string[]
}`;
}

export function buildReferralMessagePrompt(studentInfo: string, opportunityInfo: string): string {
  return `You are an expert career coach helping a college student draft a professional LinkedIn-style message to an alumni to request a referral for an opportunity.
The message should be polite, concise (under 150 words), and highlight the student's relevant skills.

Student Profile:
${studentInfo}

Target Opportunity:
${opportunityInfo}

Draft the referral request message. Do not include placeholders like "[Your Name]" if the name is provided.

Respond with ONLY valid JSON using this schema:
{
  "message": string
}`;
}

export function buildCareerRoadmapPrompt(currentSkills: string[], careerGoal: string): string {
  return `You are a career mentor. A student wants to reach a specific career goal.

Current Skills: ${currentSkills.join(", ")}
Career Goal: ${careerGoal}

Analyze the skill gap. 
Identify the missing skills required to achieve this goal.
Provide a step-by-step roadmap (3-5 steps) with actionable learning resources or project ideas.

Respond with ONLY valid JSON using this schema:
{
  "missingSkills": string[],
  "roadmapSteps": [
    {
      "step": number,
      "title": string,
      "description": string
    }
  ]
}`;
}

export function buildCareerIntelligencePrompt(profileData: string, resumeText: string, targetRole?: string): string {
  const roleContext = targetRole ? `Target Role: ${targetRole}\n` : `Target Role: Not specified (Provide general career advice based on their profile).\n`;
  return `[Career Prompt v1]
You are an expert Career AI acting as the core intelligence engine for a student's Career Digital Twin.
Analyze the following student profile and resume data to generate a highly structured canonical Career State.

Student Profile Data:
${profileData}

Resume Text:
${resumeText}

${roleContext}

You must evaluate this data and return ONLY a valid JSON object strictly matching this schema:
{
  "readinessScore": number, // 0-100 indicating readiness for the target role or general job market
  "confidenceScore": number, // 0-100 indicating psychological confidence/clarity based on profile completeness and direction
  "intelligence": {
    "aiConfidence": number, // 0-100 indicating how confident you are in this overall analysis
    "careerSummary": "string (A holistic executive summary of their career state)",
    "strengths": ["string"],
    "weaknesses": ["string"],
    "learningPriorities": ["string"],
    "implicitSkills": ["string"],
    "topDomains": ["string (e.g. Frontend, Data Science)"],
    "careerStage": "string (e.g. Exploring, Upskilling, Job Ready)",
    "resumeQuality": {
      "score": number, // 0-100
      "summary": "string (A brief evaluation of the resume structure and impact)"
    }
  }
}
Do not include markdown fences, preamble, or explanations. Just the JSON.`;
}


export function buildCareerInsightPrompt(careerIntelligence: any): string {
  return `[Career Insight Prompt v1]
You are an expert Career AI acting as the Insight Engine for a student's Career Digital Twin.
Analyze the following canonical Career State intelligence and derive high-impact, actionable insights.

Career Intelligence Data:
${JSON.stringify(careerIntelligence, null, 2)}

You must evaluate this data and return ONLY a valid JSON array strictly matching this schema:
[
  {
    "category": "string (One of: ALERT, OPPORTUNITY, FOCUS, MOMENTUM)",
    "priorityScore": number, // 0-100 indicating urgency
    "impactScore": number, // 0-100 defining the expected career ROI
    "title": "string (Short, punchy title)",
    "description": "string (Clear explanation of the insight)",
    "actionableStep": "string (Optional, concrete next step to take)",
    "reasoning": "string (Explanation of why this insight exists based on the Career State)",
    "generatedBy": "AI"
  }
]

Generate at most 3-4 highly relevant insights. Do not include markdown fences, preamble, or explanations. Just the JSON array.`;
}

export function buildGoalEvaluationPrompt(careerState: any, careerGoal: any): string {
  return `[Goal Evaluation Prompt v1]
Evaluate the user's Career State against their Career Goal.
State:
${JSON.stringify(careerState, null, 2)}
Goal:
${JSON.stringify(careerGoal, null, 2)}

You must return ONLY a valid JSON object matching this schema:
{
  "goalHealth": number, // 0-100 indicating how realistic this goal is
  "matchedSkills": ["string"], // Skills in state that map to goal
  "missingSkills": ["string"], // Critical gaps
  "reasoning": "string" // Why you gave this health score
}
Do not include markdown fences, preamble, or explanations.`;
}

export function buildRecommendationPrompt(careerState: any, careerInsight: any, careerGoal: any): string {
  return `[Recommendation Prompt v1]
Generate exactly 5 high-impact, actionable career recommendations based on the user's current situation.
Career State:
${JSON.stringify(careerState, null, 2)}
Career Insight:
${JSON.stringify(careerInsight, null, 2)}
Career Goal:
${JSON.stringify(careerGoal, null, 2)}

Return ONLY a JSON array matching this schema:
[
  {
    "category": "string (One of: LEARNING, PROJECT, CERTIFICATION, JOB, REFERRAL, NETWORKING, COMPETITION, OPEN_SOURCE)",
    "title": "string",
    "description": "string (Why this matters)",
    "reasoning": "string (Connection to their goals)",
    "actionableStep": "string (Specific next action)",
    "estimatedHours": number,
    "priorityScore": number, // 0-100
    "impactScore": number, // 0-100
    "confidenceScore": number, // 0-100
    "resourceSearchKeywords": "string (Generic search terms like 'React Official Docs', NO URLs)"
  }
]
Do not include markdown fences, preamble, or explanations.`;
}

export function buildMissionGenerationPrompt(careerState: any, careerGoal: any, careerInsight: any, recommendations: any): string {
  return `[Mission Generation Prompt v1]
Generate an ordered execution roadmap (Missions) based on the user's current situation.
Career State:
${JSON.stringify(careerState, null, 2)}
Career Insight:
${JSON.stringify(careerInsight, null, 2)}
Career Goal:
${JSON.stringify(careerGoal, null, 2)}
Recommendations:
${JSON.stringify(recommendations, null, 2)}

Return ONLY a JSON object matching this schema:
{
  "summary": "string (Overall strategy)",
  "missions": [
    {
      "title": "string",
      "description": "string",
      "objective": "string",
      "estimatedHours": number,
      "priorityScore": number, // 0-100
      "impactScore": number, // 0-100
      "difficultyScore": number, // 0-100
      "reasoning": "string"
    }
  ]
}
Do not include markdown fences, preamble, or explanations.`;
}
