import { prisma } from "@/lib/prisma";

export const profileRepository = {
  async upsertStudentProfile(userId: string, data: {
    department: string;
    skills: string[];
    projects?: string | null;
    resumeUrl?: string | null;
  }) {
    return await prisma.studentProfile.upsert({
      where: { userId },
      update: {
        department: data.department,
        skills: data.skills,
        projects: data.projects,
        resumeUrl: data.resumeUrl,
      },
      create: {
        userId,
        department: data.department,
        skills: data.skills,
        projects: data.projects,
        resumeUrl: data.resumeUrl,
      }
    });
  },

  async upsertAlumniProfile(userId: string, data: {
    company: string;
    jobRole: string;
    department: string;
    industry: string;
    experienceYrs: number;
    skills: string[];
  }) {
    return await prisma.alumniProfile.upsert({
      where: { userId },
      update: {
        company: data.company,
        jobRole: data.jobRole,
        department: data.department,
        industry: data.industry,
        experienceYrs: data.experienceYrs,
        skills: data.skills,
      },
      create: {
        userId,
        company: data.company,
        jobRole: data.jobRole,
        department: data.department,
        industry: data.industry,
        experienceYrs: data.experienceYrs,
        skills: data.skills,
      }
    });
  },

  async getProfileByUserId(userId: string, role: string) {
    if (role === 'STUDENT') {
      return await prisma.studentProfile.findUnique({ where: { userId } });
    } else if (role === 'ALUMNI') {
      return await prisma.alumniProfile.findUnique({ where: { userId } });
    }
    return null;
  }
};
