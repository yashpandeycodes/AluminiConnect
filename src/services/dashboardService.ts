import { profileRepository } from "@/repositories/profileRepository";
import { careerStateRepository } from "@/repositories/careerStateRepository";
import { goalRepository } from "@/repositories/goalRepository";
import { recommendationRepository } from "@/repositories/recommendationRepository";
import { missionRepository } from "@/repositories/missionRepository";
import { timelineRepository } from "@/repositories/timelineRepository";
import { analyticsRepository } from "@/repositories/analyticsRepository";
import { predictionRepository } from "@/repositories/predictionRepository";
import { careerInsightService } from "@/services/careerInsightService";
import { DashboardDTO, DashboardHero, DashboardInsights } from "@/types/dashboard";
import { Result } from "@/types";
import { prisma } from "@/lib/prisma";
import { DynamicTimelineView, TimelineData } from "@/types/timeline";

export const dashboardService = {
  async getDashboardData(userId: string): Promise<Result<DashboardDTO>> {
    try {
      // 1. Fetch Everything in Parallel (BFF Aggregation)
      // Since Insights has no persistence, we compute it on the fly
      const [
        user,
        state,
        goal,
        recommendations,
        missions,
        timelineRow,
        analyticsRow,
        predictionRow,
        insightsResult
      ] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId }, include: { studentProfile: true } }),
        careerStateRepository.getByUserId(userId),
        goalRepository.getActiveGoal(userId),
        recommendationRepository.getHistory(userId),
        missionRepository.getHistory(userId),
        timelineRepository.getActive(userId),
        analyticsRepository.getByUserId(userId),
        predictionRepository.getByUserId(userId),
        careerInsightService.computeInsights(userId).catch(() => ({ success: false, data: null }))
      ]);

      if (!user) return { success: false, error: { code: "NOT_FOUND", message: "User not found" } };

      const activeRecommendations = recommendations.filter(r => r.status !== "COMPLETED" && r.status !== "DISMISSED");
      const activeMissions = missions.filter(m => m.status === "ACTIVE");
      
      const analytics = analyticsRow?.currentMetrics as any;
      const prediction = predictionRow?.currentPrediction as any;
      const computedInsights = (insightsResult as any)?.data;

      // 2. Compute Hero
      const studentName = user.name || "Student";
      const targetRole = goal?.targetRole || "Aspiring Professional";
      const readinessScore = state?.readinessScore || 0;
      const overallProgress = analytics?.overallProgress || 0;
      const goalProbability = prediction?.goalAchievementProbability || 0;
      
      let careerHealthIndicator: "EXCELLENT" | "GOOD" | "FAIR" | "AT_RISK" = "GOOD";
      if (overallProgress > 80 && goalProbability > 75) careerHealthIndicator = "EXCELLENT";
      else if (overallProgress < 40 || goalProbability < 40) careerHealthIndicator = "AT_RISK";
      else if (overallProgress < 60) careerHealthIndicator = "FAIR";

      const motivationalSummary = goal 
        ? `You're making steady progress towards becoming a ${targetRole}. Keep your momentum up!`
        : "Set a Career Goal to receive personalized AI guidance and timelines.";

      const hero: DashboardHero = {
        studentName,
        targetRole,
        readinessScore,
        overallProgress,
        goalProbability,
        careerHealthIndicator,
        motivationalSummary
      };

      // 3. Compute Insights
      let insights: DashboardInsights | null = null;
      if (computedInsights && computedInsights.insights) {
        const rawInsights = computedInsights.insights;
        const alertInsight = rawInsights.find((i: any) => i.category === "ALERT");
        const oppInsight = rawInsights.find((i: any) => i.category === "OPPORTUNITY");
        
        insights = {
          biggestWeakness: alertInsight?.title || null,
          biggestOpportunity: oppInsight?.title || null,
          weeklyFocus: "Focus on closing your primary skill gaps this week.", // Static for now
          momentum: prediction?.productivityTrend === "IMPROVING" ? "High" : (prediction?.productivityTrend === "DECLINING" ? "Low" : "Stable")
        };
      }

      // 4. Compute Dynamic Timeline
      let dynamicTimeline: DynamicTimelineView | null = null;
      if (timelineRow && timelineRow.timeline) {
        const timelineData = timelineRow.timeline as unknown as TimelineData;
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        const endOfWeek = new Date(startOfToday);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

        dynamicTimeline = {
          today: [],
          thisWeek: [],
          future: [],
          overdue: [],
          statistics: timelineData.statistics
        };

        for (const m of (timelineData.missions || [])) {
          const startDate = new Date(m.startDate);
          const endDate = new Date(m.endDate);

          if (endDate < startOfToday) {
             dynamicTimeline.overdue.push(m);
          } else {
            if (startDate < endOfToday) dynamicTimeline.today.push(m);
            if (startDate < endOfWeek) dynamicTimeline.thisWeek.push(m);
            if (startDate >= endOfWeek) dynamicTimeline.future.push(m);
          }
        }
      }

      // 5. Construct Final DTO
      const dashboardDTO: DashboardDTO = {
        hero,
        insights,
        recommendations: activeRecommendations,
        missions: activeMissions,
        timeline: dynamicTimeline,
        analytics: analytics || null,
        prediction: prediction || null,
        goal: goal || null
      };

      return { success: true, data: dashboardDTO };
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      return { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to assemble dashboard." } };
    }
  }
};
