"use client";

import React from "react";
import { DashboardHero as HeroData } from "@/types/dashboard";
import { motion } from "framer-motion";
import { Activity, Target, Trophy, AlertTriangle, ShieldCheck } from "lucide-react";

export function DashboardHero({ data }: { data: HeroData }) {
  const isHealthy = data.careerHealthIndicator === "EXCELLENT" || data.careerHealthIndicator === "GOOD";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Hello, {data.studentName}
            </h1>
            <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5
              ${isHealthy 
                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400" 
                : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
              {isHealthy ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {data.careerHealthIndicator}
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Targeting: <span className="font-semibold text-gray-900 dark:text-gray-200">{data.targetRole}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-lg mt-2 leading-relaxed">
            {data.motivationalSummary}
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {/* Stat 1 */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex-1 md:w-32 flex flex-col items-center justify-center text-center">
            <div className="text-blue-600 dark:text-blue-400 mb-1">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.readinessScore}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium uppercase tracking-wider">Readiness</div>
          </div>
          
          {/* Stat 2 */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex-1 md:w-32 flex flex-col items-center justify-center text-center">
            <div className="text-purple-600 dark:text-purple-400 mb-1">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(data.overallProgress)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium uppercase tracking-wider">Progress</div>
          </div>

          {/* Stat 3 */}
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex-1 md:w-32 flex flex-col items-center justify-center text-center">
            <div className="text-green-600 dark:text-green-400 mb-1">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(data.goalProbability)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium uppercase tracking-wider">Success Prob</div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
