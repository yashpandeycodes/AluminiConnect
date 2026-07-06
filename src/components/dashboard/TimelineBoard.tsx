"use client";
import React from "react";
import { DynamicTimelineView } from "@/types/timeline";
import { Calendar, AlertCircle } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { SectionHeader } from "./SectionHeader";

export function TimelineBoard({ timeline }: { timeline: DynamicTimelineView | null }) {
  if (!timeline) return <EmptyState title="Timeline Empty" message="Your missions haven't been scheduled yet." />;

  const renderTask = (m: any) => (
    <div key={m.missionId} className="flex flex-col p-3 rounded-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 shadow-sm text-sm">
      <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{m.title}</span>
      <span className="text-xs text-gray-500 mt-1">{m.allocatedHours} hours</span>
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <SectionHeader title="Weekly Schedule" action={<button className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"><Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300"/></button>} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overdue */}
        {timeline.overdue.length > 0 && (
          <div className="bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-3 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5"/> Overdue
            </h3>
            <div className="space-y-2">{timeline.overdue.map(renderTask)}</div>
          </div>
        )}

        {/* Today */}
        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">Today</h3>
          <div className="space-y-2">{timeline.today.length > 0 ? timeline.today.map(renderTask) : <p className="text-xs text-gray-500 py-2">No tasks scheduled for today.</p>}</div>
        </div>

        {/* This Week */}
        <div className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-3">This Week</h3>
          <div className="space-y-2">{timeline.thisWeek.length > 0 ? timeline.thisWeek.map(renderTask) : <p className="text-xs text-gray-500 py-2">No further tasks this week.</p>}</div>
        </div>
      </div>
    </div>
  );
}
