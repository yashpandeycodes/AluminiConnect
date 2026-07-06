import React from "react";
import { CheckSquare, Calendar, Play } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MissionCard } from "@/components/dashboard/MissionCard";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";

export default async function MissionPlannerWorkspace() {
  const session = await getServerSession(authOptions);
  const result = await dashboardService.getDashboardData(session?.user?.id || "");
  const missions = result.success ? result.data.missions : [];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mission Planner</h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Play className="w-4 h-4" />
          Generate Execution Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ErrorBoundary>
             <MissionCard missions={missions} />
          </ErrorBoundary>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#111111] p-5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
             <h3 className="font-bold text-gray-900 dark:text-white mb-4">Execution Panel</h3>
             <button className="w-full mb-2 flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-sm font-medium dark:text-gray-200">Reschedule All</span>
                <Calendar className="w-4 h-4 text-blue-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <span className="text-sm font-medium dark:text-gray-200">Mark Completed</span>
                <CheckSquare className="w-4 h-4 text-green-500" />
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
