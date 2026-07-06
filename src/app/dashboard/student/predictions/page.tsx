import React from "react";
import { LineChart, Settings2 } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PredictionCard } from "@/components/dashboard/PredictionCard";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";

export default async function PredictionsWorkspace() {
  const session = await getServerSession(authOptions);
  const result = await dashboardService.getDashboardData(session?.user?.id || "");
  const prediction = result.success ? result.data.prediction : null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Predictions Simulator</h1>
        <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors dark:text-gray-300">
            <Settings2 className="w-4 h-4" />
            Configure Model Settings
        </button>
      </div>

      <div>
        <ErrorBoundary>
           <PredictionCard prediction={prediction} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
