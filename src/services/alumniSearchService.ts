import { prisma } from "@/lib/prisma";

export type AlumniSearchParams = {
  company?: string;
  role?: string;
  industry?: string;
  department?: string;
  graduationYear?: number;
};

type AlumniWithUser = {
  id: string;
  userId: string;
  company: string;
  jobRole: string;
  department: string;
  industry: string;
  experienceYrs: number;
  skills: string[];
  responsivenessScore: number;
  referralSuccessRate: number;
  verifiedBadge: boolean;
  user: {
    name: string;
    collegeEmail: string;
    graduationYear: number;
  };
};

function jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

export const alumniSearchService = {
  computeAlumniRankScore(
    studentSkills: string[],
    alumni: AlumniWithUser,
    searchParams: AlumniSearchParams
  ): number {
    let score = 0;

    // 1. Company Relevance (30%)
    // If the user explicitly searched for a company and it matches, give a big boost.
    if (searchParams.company && alumni.company.toLowerCase().includes(searchParams.company.toLowerCase())) {
      score += 30;
    } else if (!searchParams.company) {
      // If no company searched, baseline company relevance is normalized.
      score += 15;
    }

    // 2. Skill Similarity (Overlap) (40%)
    const studentSkillsSet = new Set(studentSkills.map(s => s.toLowerCase()));
    const alumniSkillsSet = new Set(alumni.skills.map(s => s.toLowerCase()));
    const similarity = jaccardSimilarity(studentSkillsSet, alumniSkillsSet);
    score += similarity * 40;

    // 3. Referral Success Rate (20%)
    score += (alumni.referralSuccessRate / 100) * 20;

    // 4. Responsiveness (10%)
    // Assuming responsiveness is 0-100 score
    score += (alumni.responsivenessScore / 100) * 10;

    return score;
  },

  async searchAlumni(searcherUserId: string, filters: AlumniSearchParams) {
    // 1. Get searcher's skills (if they are a student)
    const searcherProfile = await prisma.studentProfile.findUnique({
      where: { userId: searcherUserId },
      select: { skills: true },
    });
    
    const searcherSkills = searcherProfile?.skills || [];

    // 2. Build Prisma where clause based on hard filters
    const whereClause: import("@prisma/client").Prisma.AlumniProfileWhereInput = {};

    if (filters.company) {
      whereClause.company = { contains: filters.company, mode: "insensitive" };
    }
    if (filters.role) {
      whereClause.jobRole = { contains: filters.role, mode: "insensitive" };
    }
    if (filters.industry) {
      whereClause.industry = { contains: filters.industry, mode: "insensitive" };
    }
    if (filters.department) {
      whereClause.department = { contains: filters.department, mode: "insensitive" };
    }
    if (filters.graduationYear) {
      whereClause.user = {
        graduationYear: filters.graduationYear
      };
    }

    // 3. Fetch alumni from DB
    const alumniList = await prisma.alumniProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            collegeEmail: true,
            graduationYear: true,
          }
        }
      }
    });

    // 4. Map and rank
    const rankedAlumni = alumniList.map(alumni => {
      const score = this.computeAlumniRankScore(searcherSkills, alumni, filters);
      return {
        ...alumni,
        matchScore: score
      };
    });

    // Sort descending by matchScore
    rankedAlumni.sort((a, b) => b.matchScore - a.matchScore);

    return { success: true, data: rankedAlumni };
  }
};
