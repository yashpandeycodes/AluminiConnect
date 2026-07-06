"use client";
import React from "react";
import { Bookmark, ExternalLink } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { SectionHeader } from "./SectionHeader";

export function RecommendationCard({ recommendations }: { recommendations: any[] }) {
  if (!recommendations || recommendations.length === 0) return <EmptyState title="No Recommendations" message="No new recommendations available at the moment." />;

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <SectionHeader title="Top Recommendations" subtitle="High impact actions suggested for you" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.slice(0, 4).map((rec) => (
          <div key={rec.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex flex-col justify-between h-full group hover:border-purple-200 dark:hover:border-purple-900 transition-colors cursor-pointer">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">{rec.category || "General"}</span>
                <Bookmark className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug">{rec.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{rec.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">{rec.estimatedHours}h est.</span>
              <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline">
                View <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
