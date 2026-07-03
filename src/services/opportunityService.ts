import { opportunityRepository } from "@/repositories/opportunityRepository";
import { contributionService } from "@/services/contributionService";
import { createOpportunitySchema } from "@/validators/opportunityValidators";
import { z } from "zod";
import { Result } from "@/types";
import { prisma } from "@/lib/prisma";

import { Opportunity, Prisma } from "@prisma/client";

export const opportunityService = {
  async createOpportunity(userId: string, role: string, data: unknown): Promise<Result<Opportunity>> {
    try {
      if (role !== "ALUMNI" && role !== "ADMIN") {
        return { success: false, error: { code: "FORBIDDEN", message: "Only alumni can post opportunities." } };
      }

      const parsed = createOpportunitySchema.parse(data);

      const opportunity = await opportunityRepository.createOpportunity({
        postedById: userId,
        company: parsed.company,
        role: parsed.role,
        eligibility: parsed.eligibility,
        requiredSkills: parsed.requiredSkills,
        deadline: new Date(parsed.deadline),
        applicationLink: parsed.applicationLink,
      });

      // Award 10 points for posting an opportunity
      await contributionService.addContribution(userId, 10, "OPPORTUNITY_POSTED");

      return { success: true, data: opportunity };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return { success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } };
      }
      console.error("Create opportunity error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create opportunity." } };
    }
  },

  async getOpportunity(id: string): Promise<Result<Opportunity>> {
    try {
      const opportunity = await opportunityRepository.getOpportunityById(id);
      if (!opportunity) {
        return { success: false, error: { code: "NOT_FOUND", message: "Opportunity not found." } };
      }
      return { success: true, data: opportunity };
    } catch (error: unknown) {
      console.error("Get opportunity error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to get opportunity." } };
    }
  },

  async listOpportunities(filters?: Prisma.OpportunityWhereInput): Promise<Result<(Opportunity & { rankScore: number })[]>> {
    try {
      const opportunities = await opportunityRepository.listOpportunities(filters);
      
      // Ranking logic: sort by alumni metrics
      // 1. Seniority (older graduation year = higher seniority, e.g., 2020 > 2023) -> we will use (currentYear - graduationYear)
      // 2. Referral Success Rate
      // 3. Responsiveness Score (if available, otherwise we use general activity)
      const currentYear = new Date().getFullYear();

      const ranked = opportunities.map(opp => {
        let score = 0;
        const profile = opp.postedBy.alumniProfile;
        
        if (profile) {
          // Seniority points
          const yearsSinceGrad = Math.max(0, currentYear - opp.postedBy.graduationYear);
          score += yearsSinceGrad * 5; 
          
          // Contribution/Success metrics
          score += (profile.referralSuccessRate / 100) * 30;
          score += (profile.responsivenessScore / 100) * 20;
          
          if (profile.verifiedBadge) {
            score += 20;
          }
        }
        
        return {
          ...opp,
          rankScore: score
        };
      });

      // Sort descending by rank score
      ranked.sort((a, b) => b.rankScore - a.rankScore);

      return { success: true, data: ranked };
    } catch (error: unknown) {
      console.error("List opportunities error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to list opportunities." } };
    }
  }
};
