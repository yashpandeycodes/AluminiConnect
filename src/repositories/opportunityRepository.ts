import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const opportunityRepository = {
  async createOpportunity(data: Prisma.OpportunityUncheckedCreateInput) {
    return await prisma.opportunity.create({
      data,
    });
  },

  async getOpportunityById(id: string) {
    return await prisma.opportunity.findUnique({
      where: { id },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            collegeEmail: true,
            graduationYear: true,
            alumniProfile: true,
          }
        },
        _count: {
          select: { referrals: true }
        }
      }
    });
  },

  async listOpportunities(filters?: Prisma.OpportunityWhereInput) {
    // For ranking/grouping, we need robust inclusion
    return await prisma.opportunity.findMany({
      where: filters,
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: {
            id: true,
            name: true,
            collegeEmail: true,
            graduationYear: true,
            alumniProfile: true,
          }
        },
        _count: {
          select: { referrals: true }
        }
      }
    });
  }
};
