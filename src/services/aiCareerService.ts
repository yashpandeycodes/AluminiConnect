import { generateJSON, generateJSONWithPdf } from "@/lib/ai/gemini";
import { buildAtsScorePrompt, buildReferralMessagePrompt, buildCareerRoadmapPrompt } from "@/lib/ai/prompts";
import { Result } from "@/types";

export type AtsScoreResult = {
  score: number;
  missingKeywords: string[];
  suggestions: string[];
};

export type ReferralMessageResult = {
  message: string;
};

export type CareerRoadmapResult = {
  missingSkills: string[];
  roadmapSteps: {
    step: number;
    title: string;
    description: string;
  }[];
};

export const aiCareerService = {
  async scoreResume(resumeText: string, targetRole: string): Promise<Result<AtsScoreResult>> {
    try {
      if (!resumeText || !targetRole) {
         return { success: false, error: { code: "INVALID_REQUEST", message: "Resume text and target role are required." } };
      }
      const prompt = buildAtsScorePrompt(resumeText, targetRole);
      const data = await generateJSON<AtsScoreResult>(prompt);
      return { success: true, data };
    } catch (error) {
      console.error("Score resume error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to score resume." } };
    }
  },

  async scoreResumePdf(pdfBase64: string, targetRole: string): Promise<Result<AtsScoreResult>> {
    try {
      if (!pdfBase64 || !targetRole) {
         return { success: false, error: { code: "INVALID_REQUEST", message: "Resume PDF and target role are required." } };
      }
      const prompt = buildAtsScorePrompt("Evaluate the attached PDF resume.", targetRole);
      const data = await generateJSONWithPdf<AtsScoreResult>(pdfBase64, prompt);
      return { success: true, data };
    } catch (error) {
      console.error("Score resume PDF error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to score resume PDF." } };
    }
  },

  async generateReferralMessage(studentInfo: string, opportunityInfo: string): Promise<Result<ReferralMessageResult>> {
    try {
      if (!studentInfo || !opportunityInfo) {
         return { success: false, error: { code: "INVALID_REQUEST", message: "Student info and opportunity info are required." } };
      }
      const prompt = buildReferralMessagePrompt(studentInfo, opportunityInfo);
      const data = await generateJSON<ReferralMessageResult>(prompt);
      return { success: true, data };
    } catch (error) {
      console.error("Generate referral message error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate referral message." } };
    }
  },

  async generateCareerRoadmap(currentSkills: string[], careerGoal: string): Promise<Result<CareerRoadmapResult>> {
    try {
      if (!currentSkills || currentSkills.length === 0 || !careerGoal) {
         return { success: false, error: { code: "INVALID_REQUEST", message: "Current skills and career goal are required." } };
      }
      const prompt = buildCareerRoadmapPrompt(currentSkills, careerGoal);
      const data = await generateJSON<CareerRoadmapResult>(prompt);
      return { success: true, data };
    } catch (error) {
      console.error("Generate career roadmap error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate career roadmap." } };
    }
  }
};
