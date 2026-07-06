"use client";
import React from "react";
import { DashboardInsights } from "@/types/dashboard";
import { Lightbulb, TrendingUp, AlertCircle, Focus } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { SectionHeader } from "./SectionHeader";

export function InsightCard({ insights }: { insights: DashboardInsights | null }) {
  if (!insights) return <EmptyState title="No Insights Yet" message="Complete some tasks to generate AI insights." />;

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <SectionHeader title="AI Insights" />
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Primary Weakness</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{insights.biggestWeakness || "None identified yet."}</p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-2 text-green-600 dark:text-green-500">
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Biggest Opportunity</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{insights.biggestOpportunity || "None identified yet."}</p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1 text-blue-600 dark:text-blue-500">
                <Focus className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Weekly Focus</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{insights.weeklyFocus}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-purple-600 dark:text-purple-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Momentum</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{insights.momentum}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
