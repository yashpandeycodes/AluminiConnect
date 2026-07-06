import React from "react";
import { Target, Edit2, Play, Archive, CheckCircle } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoalCard } from "@/components/dashboard/GoalCard";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";

export default async function GoalsWorkspace() {
  const session = await getServerSession(authOptions);
  const result = await dashboardService.getDashboardData(session?.user?.id || "");
  const goal = result.success ? result.data.goal : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals Workspace</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors dark:text-gray-300">
            <Archive className="w-4 h-4" />
            Archive
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit Goal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
           <ErrorBoundary>
              <GoalCard goal={goal} />
           </ErrorBoundary>
        </div>

        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">Next Steps</h3>
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="text-sm font-medium dark:text-gray-200">Generate Recommendations</span>
            <Play className="w-4 h-4 text-blue-500" />
          </button>
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="text-sm font-medium dark:text-gray-200">View Progress</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
