import { CareerMission, CareerGoal } from "@prisma/client";
import { TimelineData, ScheduledMission } from "@/types/timeline";

export interface SchedulerInput {
  missions: CareerMission[]; // Must be ordered by orderIndex
  goal: CareerGoal | null;
  weeklyHours: number;
}

export interface SchedulerOutput {
  timeline: TimelineData;
  estimatedCompletionDate: Date | null;
  totalEstimatedHours: number;
  scheduleHealth: number;
}

export const timelineScheduler = {
  generateSchedule(input: SchedulerInput): SchedulerOutput {
    const { missions, goal, weeklyHours } = input;
    const now = new Date();
    
    // Split missions into completed vs remaining
    const completedMissions = missions.filter(m => m.status === "COMPLETED");
    const activeMissions = missions.filter(m => m.status === "ACTIVE");
    
    const completedHours = completedMissions.reduce((acc, m) => acc + m.estimatedHours, 0);
    const remainingHours = activeMissions.reduce((acc, m) => acc + m.estimatedHours, 0);
    const totalEstimatedHours = completedHours + remainingHours;
    const completionPercentage = totalEstimatedHours > 0 ? (completedHours / totalEstimatedHours) * 100 : 0;

    // Distribute remaining active missions
    let currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    let currentWeekHoursUsed = 0;
    const scheduledMissions: ScheduledMission[] = [];

    for (const mission of activeMissions) {
      let hoursLeftInMission = mission.estimatedHours;
      let missionStartDate: Date | null = null;
      let missionEndDate: Date | null = null;
      
      while (hoursLeftInMission > 0) {
        const availableInWeek = weeklyHours - currentWeekHoursUsed;
        
        if (availableInWeek <= 0) {
          // Move to next week
          currentDate.setDate(currentDate.getDate() + (7 - currentDate.getDay())); // Skip to next Sunday
          currentWeekHoursUsed = 0;
          continue;
        }

        if (!missionStartDate) missionStartDate = new Date(currentDate);
        missionEndDate = new Date(currentDate);

        const allocateHours = Math.min(hoursLeftInMission, availableInWeek);
        hoursLeftInMission -= allocateHours;
        currentWeekHoursUsed += allocateHours;
      }

      if (missionStartDate && missionEndDate) {
        scheduledMissions.push({
          missionId: mission.id,
          title: mission.title,
          allocatedHours: mission.estimatedHours,
          startDate: missionStartDate.toISOString(),
          endDate: missionEndDate.toISOString()
        });
      }
    }

    const estimatedCompletionDate = remainingHours > 0 ? new Date(currentDate) : now;

    // Calculate Schedule Health and Buffer
    let scheduleHealth = 100;
    let bufferPercentage = 0;

    if (goal?.deadline && remainingHours > 0) {
      const msLeft = goal.deadline.getTime() - now.getTime();
      const weeksLeft = Math.max(1, msLeft / (1000 * 60 * 60 * 24 * 7));
      const requiredWeeklyHours = remainingHours / weeksLeft;
      
      if (requiredWeeklyHours > weeklyHours) {
        // Penalty based on how much over capacity we are
        const penalty = ((requiredWeeklyHours - weeklyHours) / weeklyHours) * 100;
        scheduleHealth = Math.max(0, 100 - penalty);
      } else {
        const bufferHours = weeklyHours - requiredWeeklyHours;
        bufferPercentage = (bufferHours / weeklyHours) * 100;
      }
    } else if (remainingHours > 0) {
       // If no deadline, there's effectively 100% buffer from any arbitrary deadline limit, 
       // but we'll stick to calculating against the workload to keep the stat meaningful, 
       // or leave it 0 if no deadline exists.
       bufferPercentage = 0;
    }

    return {
      timeline: {
        missions: scheduledMissions,
        statistics: {
          remainingHours,
          completedHours,
          completionPercentage,
          averageHoursPerWeek: weeklyHours,
          bufferPercentage
        }
      },
      estimatedCompletionDate,
      totalEstimatedHours,
      scheduleHealth
    };
  }
};
