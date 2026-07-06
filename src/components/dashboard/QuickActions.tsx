"use client";
import React from "react";
import Link from "next/link";
import { DashboardDTO } from "@/types/dashboard";
import { Upload, Activity, Target, Lightbulb, CheckSquare, Calendar, RefreshCw } from "lucide-react";

export function QuickActions({ data }: { data: DashboardDTO }) {
  
  // Logic to determine what needs to happen next
  const hasResume = data.hero.readinessScore > 0;
  const hasGoal = !!data.goal;
  const hasRecommendations = data.recommendations.length > 0;
  const hasMissions = data.missions.length > 0;
  const hasTimeline = !!data.timeline && data.timeline.today.length > 0;

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        
        {!hasResume && (
          <Link href="/dashboard/student/resume" className="flex flex-col items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
            <Upload className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold text-center">Upload Resume</span>
          </Link>
        )}

        {hasResume && (
          <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Activity className="w-6 h-6 mb-2 text-indigo-500" />
            <span className="text-xs font-semibold text-center">Refresh State</span>
          </button>
        )}

        {!hasGoal && hasResume && (
          <Link href="/dashboard/student/goals" className="flex flex-col items-center justify-center p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-lg text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-colors">
            <Target className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold text-center">Set Goal</span>
          </Link>
        )}

        {hasGoal && !hasRecommendations && (
          <button className="flex flex-col items-center justify-center p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
            <Lightbulb className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold text-center">Get Recommendations</span>
          </button>
        )}

        {hasRecommendations && !hasMissions && (
          <button className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors">
            <CheckSquare className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold text-center">Generate Missions</span>
          </button>
        )}

        {hasMissions && !hasTimeline && (
          <button className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
            <Calendar className="w-6 h-6 mb-2" />
            <span className="text-xs font-semibold text-center">Build Timeline</span>
          </button>
        )}

        <button className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <RefreshCw className="w-6 h-6 mb-2 text-gray-400" />
            <span className="text-xs font-semibold text-center">Sync All AI</span>
        </button>
      </div>
    </div>
  );
}
