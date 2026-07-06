"use client";
import React from "react";
import { CareerMission } from "@prisma/client";
import { CheckCircle, Clock } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { SectionHeader } from "./SectionHeader";

export function MissionCard({ missions }: { missions: CareerMission[] }) {
  if (!missions || missions.length === 0) return <EmptyState title="No Active Missions" message="You have completed all your current tasks." />;

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <SectionHeader title="Active Missions" subtitle="Your current execution goals" />
      <div className="space-y-3">
        {missions.slice(0, 3).map((mission) => (
          <div key={mission.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-colors group">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{mission.title}</span>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {mission.estimatedHours}h est.</span>
              </div>
            </div>
            <button className="p-2 rounded-full text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10 transition-colors">
              <CheckCircle className="w-5 h-5" />
            </button>
          </div>
        ))}
        {missions.length > 3 && (
          <button className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            View all {missions.length} active missions &rarr;
          </button>
        )}
      </div>
    </div>
  );
}
