import React from "react";
import { Calendar, Clock, RefreshCw } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TimelineBoard } from "@/components/dashboard/TimelineBoard";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";

export default async function TimelineWorkspace() {
  const session = await getServerSession(authOptions);
  const result = await dashboardService.getDashboardData(session?.user?.id || "");
  const timeline = result.success ? result.data.timeline : null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Timeline</h1>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors dark:text-gray-300">
                <Clock className="w-4 h-4" />
                Change Weekly Hours
            </button>
            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <RefreshCw className="w-4 h-4" />
                Recalculate Schedule
            </button>
        </div>
      </div>

      <div>
        <ErrorBoundary>
            <TimelineBoard timeline={timeline} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
