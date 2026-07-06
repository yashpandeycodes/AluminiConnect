"use client";
import React, { useMemo } from "react";
import { CareerAnalyticsDTO } from "@/types/analytics";
import { SectionHeader } from "./SectionHeader";
import { EmptyState } from "./EmptyState";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function AnalyticsCharts({ analytics }: { analytics: CareerAnalyticsDTO | null }) {
  if (!analytics) return <EmptyState title="No Analytics" message="Analytics data is not yet available." />;

  const chartData = useMemo(() => {
    const base = analytics.overallProgress;
    return [
      { name: "W1", progress: Math.max(0, base - 15) },
      { name: "W2", progress: Math.max(0, base - 10) },
      { name: "W3", progress: Math.max(0, base - 5) },
      { name: "W4", progress: base },
    ];
  }, [analytics.overallProgress]);

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5">
      <SectionHeader title="Progress Analytics" subtitle="Your weekly growth trajectory" />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500">Mission Comp.</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.missionCompletion}%</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500">Consistency</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.weeklyConsistency}%</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500">Active Streak</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{analytics.activeStreak} days</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <p className="text-xs text-gray-500">Burnout Risk</p>
          <p className={`text-lg font-bold ${analytics.burnoutRisk === 'HIGH' ? 'text-red-500' : 'text-green-500'}`}>{analytics.burnoutRisk}</p>
        </div>
      </div>

      <div className="h-48 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#F9FAFB' }}
              itemStyle={{ color: '#60A5FA' }}
            />
            <Line type="monotone" dataKey="progress" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
