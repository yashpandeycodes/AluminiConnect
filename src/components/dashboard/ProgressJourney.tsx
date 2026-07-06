"use client";
import React from "react";
import { DashboardDTO } from "@/types/dashboard";
import { CheckCircle2, Circle } from "lucide-react";

export function ProgressJourney({ data }: { data: DashboardDTO }) {
  // Infer progress dynamically based on available data
  const steps = [
    { name: "Profile", completed: true }, // Assumed true if they are logged in
    { name: "Resume", completed: data.hero.readinessScore > 0 },
    { name: "Career State", completed: data.hero.readinessScore > 0 },
    { name: "Goal", completed: !!data.goal },
    { name: "Recommendations", completed: data.recommendations.length > 0 },
    { name: "Mission", completed: data.missions.length > 0 },
    { name: "Timeline", completed: !!data.timeline && data.timeline.today.length > 0 },
    { name: "Analytics", completed: !!data.analytics },
    { name: "Prediction", completed: !!data.prediction },
  ];

  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-xl p-5 mb-6 overflow-x-auto shadow-sm">
      <div className="flex items-center min-w-max gap-2">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isNext = !step.completed && (index === 0 || steps[index - 1].completed);
          
          return (
            <React.Fragment key={step.name}>
              <div className="flex flex-col items-center gap-2 w-20">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isNext ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 animate-pulse bg-blue-50 dark:bg-blue-900/20" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-300 dark:text-gray-700" />
                )}
                <span className={`text-[10px] font-medium uppercase tracking-wider text-center ${
                  step.completed ? "text-gray-900 dark:text-gray-300" : 
                  isNext ? "text-blue-600 dark:text-blue-400" : 
                  "text-gray-400 dark:text-gray-600"
                }`}>
                  {step.name}
                </span>
              </div>
              {!isLast && (
                <div className={`h-px w-8 -mt-5 ${step.completed ? "bg-green-500" : "bg-gray-200 dark:bg-gray-800"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
