import React, { Suspense } from "react";
import { TrendingUp, Download } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";

export default async function AnalyticsWorkspace() {
  const session = await getServerSession(authOptions);
  const result = await dashboardService.getDashboardData(session?.user?.id || "");
  const analytics = result.success ? result.data.analytics : null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <button className="flex items-center gap-2 bg-gray-900 text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div>
        <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton className="w-full h-96" />}>
               <AnalyticsCharts analytics={analytics} />
            </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
