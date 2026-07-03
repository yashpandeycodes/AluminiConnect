import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const referralRepository = {
  async createReferral(data: Prisma.ReferralUncheckedCreateInput) {
    return await prisma.referral.create({
      data,
    });
  },

  async getReferralById(id: string) {
    return await prisma.referral.findUnique({
      where: { id },
      include: {
        opportunity: true,
        requester: {
          select: {
            id: true,
            name: true,
            collegeEmail: true,
            studentProfile: true,
            alumniProfile: true,
          }
        },
        referrer: {
          select: {
            id: true,
            name: true,
            collegeEmail: true,
          }
        }
      }
    });
  },

  async getReferralsByRequester(requesterId: string) {
    return await prisma.referral.findMany({
      where: { requesterId },
      orderBy: { createdAt: 'desc' },
      include: {
        opportunity: true,
        referrer: {
          select: {
            id: true,
            name: true,
            alumniProfile: {
              select: { company: true, jobRole: true }
            }
          }
        }
      }
    });
  },

  async getReferralsByReferrer(referrerId: string) {
    return await prisma.referral.findMany({
      where: { referrerId },
      orderBy: { createdAt: 'desc' },
      include: {
        opportunity: true,
        requester: {
          select: {
            id: true,
            name: true,
            collegeEmail: true,
            studentProfile: true,
          }
        }
      }
    });
  },

  async updateReferralStatus(id: string, status: string) {
    return await prisma.referral.update({
      where: { id },
      data: { status },
    });
  }
};
