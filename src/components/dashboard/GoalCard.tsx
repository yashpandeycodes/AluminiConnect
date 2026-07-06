"use client";
import React from "react";
import { CareerGoal } from "@prisma/client";
import { Target, Calendar, Briefcase, DollarSign } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { SectionHeader } from "./SectionHeader";

export function GoalCard({ goal }: { goal: CareerGoal | null }) {
  if (!goal) return <EmptyState title="No Goal Set" message="Define your career destination to get personalized recommendations." />;

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
      <SectionHeader title="Active Goal" />
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Role</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{goal.targetRole}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Companies</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {Array.isArray(goal.targetCompanies) && goal.targetCompanies.length > 0 
                ? (goal.targetCompanies as string[]).join(", ") 
                : "Open to any"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Target Package</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">{goal.targetPackage ? `$${goal.targetPackage.toLocaleString()}` : "Not specified"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Deadline</p>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "Flexible"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
