export interface ScheduledMission {
  missionId: string;
  title: string;
  allocatedHours: number;
  startDate: string; // ISO format date string
  endDate: string; // ISO format date string
}

export interface TimelineData {
  missions: ScheduledMission[];
  statistics: {
    remainingHours: number;
    completedHours: number;
    completionPercentage: number;
    averageHoursPerWeek: number;
    bufferPercentage: number;
  };
}

export interface DynamicTimelineView {
  today: ScheduledMission[];
  thisWeek: ScheduledMission[];
  future: ScheduledMission[];
  overdue: ScheduledMission[];
  statistics: TimelineData["statistics"];
}
