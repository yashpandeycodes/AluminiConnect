import { careerStateRepository } from "@/repositories/careerStateRepository";
import { aiCareerService } from "@/services/aiCareerService";
import { CareerStateAnalysisSource, CareerStateSyncStatus } from "@prisma/client";
import { Result } from "@/types";
import { prisma } from "@/lib/prisma";

export const careerStateService = {
  async getCareerState(userId: string) {
    try {
      const state = await careerStateRepository.getByUserId(userId);
      return { success: true, data: state };
    } catch (error) {
      console.error("Get career state error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to get career state." } };
    }
  },

  async rebuildCareerState(userId: string, source: CareerStateAnalysisSource, targetRole?: string): Promise<Result<any>> {
    try {
      await careerStateRepository.markSyncing(userId, source);

      // Fetch source of truth
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId }
      });
      
      if (!studentProfile) {
        await careerStateRepository.markFailed(userId);
        return { success: false, error: { code: "NOT_FOUND", message: "Student profile not found." } };
      }

      const profileData = JSON.stringify({
        department: studentProfile.department,
        skills: studentProfile.skills,
        projects: studentProfile.projects
      });
      
      const resumeText = studentProfile.resumeUrl ? "Resume URL present (Assuming text extracted in real flow)" : "No resume";
      
      // In a real flow, you'd download/extract PDF text here if resumeUrl is provided.
      // For sprint 1, we pass a placeholder or the actual text if available in another field.
      
      const aiResult = await aiCareerService.generateCareerIntelligence(profileData, resumeText, targetRole);
      
      if (!aiResult.success || !aiResult.data) {
        await careerStateRepository.markFailed(userId);
        return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to generate intelligence." } };
      }
      
      const { data } = aiResult;
      
      const updatedState = await careerStateRepository.upsertCareerState(
        userId,
        {
          readinessScore: data.readinessScore,
          confidenceScore: data.confidenceScore,
          intelligence: data.intelligence as any,
          syncStatus: CareerStateSyncStatus.READY,
          analysisSource: source,
          analysisModel: "gemini-2.0-flash",
          schemaVersion: 1,
          lastAnalyzedAt: new Date()
        },
        {
          user: { connect: { id: userId } },
          readinessScore: data.readinessScore,
          confidenceScore: data.confidenceScore,
          intelligence: data.intelligence as any,
          syncStatus: CareerStateSyncStatus.READY,
          analysisSource: source,
          analysisModel: "gemini-2.0-flash",
          schemaVersion: 1,
        }
      );
      
      return { success: true, data: updatedState };
    } catch (error) {
      console.error("Rebuild career state error:", error);
      await careerStateRepository.markFailed(userId);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to rebuild career state." } };
    }
  },

  async refreshCareerState(userId: string): Promise<Result<any>> {
    try {
      const state = await careerStateRepository.getByUserId(userId);
      
      const REFRESH_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
      
      if (!state || state.syncStatus === CareerStateSyncStatus.FAILED) {
        return await this.rebuildCareerState(userId, CareerStateAnalysisSource.SYSTEM_REBUILD);
      }
      
      const isStale = (new Date().getTime() - new Date(state.lastAnalyzedAt).getTime()) > REFRESH_THRESHOLD_MS;
      
      if (isStale && state.syncStatus !== CareerStateSyncStatus.SYNCING) {
        // Trigger async rebuild, but return current state
        this.rebuildCareerState(userId, CareerStateAnalysisSource.SYSTEM_REBUILD).catch(console.error);
      }
      
      return { success: true, data: state };
    } catch (error) {
      console.error("Refresh career state error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to refresh career state." } };
    }
  }
};
