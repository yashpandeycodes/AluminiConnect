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
