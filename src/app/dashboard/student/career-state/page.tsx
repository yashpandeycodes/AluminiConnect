import React from "react";
import { Activity, RefreshCw } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function CareerStateWorkspace() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career State</h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <RefreshCw className="w-4 h-4" />
          Generate Career State
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <SectionHeader title="Readiness Radar" />
          <div className="h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center mt-4">
            <Activity className="w-8 h-8 text-gray-400" />
            <span className="ml-2 text-gray-400">Radar Chart Placeholder</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <SectionHeader title="AI Career Summary" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed">
            Generate your career state to let the AI analyze your underlying skills, identify your weaknesses, and map out your structural readiness for the tech industry.
          </p>
        </div>
      </div>
    </div>
  );
}
