import { referralRepository } from "@/repositories/referralRepository";
import { opportunityRepository } from "@/repositories/opportunityRepository";
import { contributionService } from "@/services/contributionService";
import { requestReferralSchema, updateReferralStatusSchema } from "@/validators/opportunityValidators";
import { z } from "zod";
import { Result } from "@/types";
import { prisma } from "@/lib/prisma";

import { Referral } from "@prisma/client";

export const referralService = {
  async requestReferral(requesterId: string, role: string, data: unknown): Promise<Result<Referral>> {
    try {
      if (role !== "STUDENT") {
        return { success: false, error: { code: "FORBIDDEN", message: "Only students can request referrals." } };
      }

      const parsed = requestReferralSchema.parse(data);

      // Verify the opportunity exists
      const opportunity = await opportunityRepository.getOpportunityById(parsed.opportunityId);
      if (!opportunity) {
        return { success: false, error: { code: "NOT_FOUND", message: "Opportunity not found." } };
      }

      // Verify the student hasn't already requested this
      const existing = await prisma.referral.findFirst({
        where: {
          opportunityId: parsed.opportunityId,
          requesterId: requesterId,
        }
      });

      if (existing) {
        return { success: false, error: { code: "CONFLICT", message: "Referral already requested for this opportunity." } };
      }

      // Create the referral
      const referral = await referralRepository.createReferral({
        opportunityId: parsed.opportunityId,
        requesterId: requesterId,
        referrerId: opportunity.postedById,
        status: "PENDING",
      });

      return { success: true, data: referral };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return { success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } };
      }
      console.error("Request referral error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to request referral." } };
    }
  },

  async updateReferralStatus(referrerId: string, referralId: string, data: unknown): Promise<Result<Referral>> {
    try {
      const parsed = updateReferralStatusSchema.parse(data);

      const referral = await referralRepository.getReferralById(referralId);
      if (!referral) {
        return { success: false, error: { code: "NOT_FOUND", message: "Referral not found." } };
      }

      if (referral.referrerId !== referrerId) {
        return { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to update this referral." } };
      }

      const updated = await referralRepository.updateReferralStatus(referralId, parsed.status);

      // If the referral is newly COMPLETED, award 25 points to the referrer
      if (parsed.status === "COMPLETED" && referral.status !== "COMPLETED") {
        await contributionService.addContribution(referrerId, 25, "REFERRAL_COMPLETED");
      }

      return { success: true, data: updated };
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        return { success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } };
      }
      console.error("Update referral status error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update referral status." } };
    }
  },

  async getMyReferrals(userId: string, role: string): Promise<Result<Referral[]>> {
    try {
      if (role === "STUDENT") {
        const referrals = await referralRepository.getReferralsByRequester(userId);
        return { success: true, data: referrals };
      } else if (role === "ALUMNI") {
        const referrals = await referralRepository.getReferralsByReferrer(userId);
        return { success: true, data: referrals };
      } else {
         return { success: true, data: [] };
      }
    } catch (error: unknown) {
      console.error("Get my referrals error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to get referrals." } };
    }
  }
};
