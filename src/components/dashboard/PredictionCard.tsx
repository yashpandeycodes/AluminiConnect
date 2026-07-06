"use client";
import React, { useState } from "react";
import { CareerPredictionDTO } from "@/types/prediction";
import { SectionHeader } from "./SectionHeader";
import { EmptyState } from "./EmptyState";
import { Zap, ShieldAlert } from "lucide-react";

export function PredictionCard({ prediction }: { prediction: CareerPredictionDTO | null }) {
  const [sliderIndex, setSliderIndex] = useState(1); // default to middle simulation

  if (!prediction) return <EmptyState title="No Forecasting Available" message="Generate more execution data to unlock predictions." />;

  const currentSim = prediction.simulations[sliderIndex] || prediction.simulations[0];

  return (
    <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/50 rounded-xl p-5 text-white">
      <SectionHeader 
        title="AI Forecast" 
        subtitle="Mathematical projections based on your velocity" 
      />
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1 text-indigo-300">
            <Zap className="w-4 h-4"/>
            <span className="text-xs uppercase font-bold tracking-wider">Velocity Score</span>
          </div>
          <span className="text-2xl font-bold">{prediction.velocityScore}</span>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1 text-red-300">
            <ShieldAlert className="w-4 h-4"/>
            <span className="text-xs uppercase font-bold tracking-wider">Delay Risk</span>
          </div>
          <span className="text-2xl font-bold">{prediction.delayRisk}</span>
        </div>
      </div>

      <div className="bg-black/20 rounded-xl p-4 border border-white/5 mt-2">
        <h3 className="text-sm font-semibold mb-3">Intervention Simulator</h3>
        <p className="text-xs text-indigo-200 mb-4">If you commit to <span className="font-bold text-white">{currentSim?.weeklyHours} hours/week</span>:</p>
        
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs text-indigo-300 mb-1">Expected Completion</p>
            <p className="text-sm font-semibold">{currentSim?.predictedCompletionDate ? new Date(currentSim.predictedCompletionDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-indigo-300 mb-1">Goal Probability</p>
            <p className="text-xl font-bold text-green-400">{currentSim?.goalProbability}%</p>
          </div>
        </div>

        <input 
          type="range" 
          min="0" 
          max={Math.max(0, prediction.simulations.length - 1)} 
          step="1"
          value={sliderIndex}
          onChange={(e) => setSliderIndex(parseInt(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-indigo-400 mt-2 font-medium">
          {prediction.simulations.map((s, i) => (
            <span key={i} className={i === sliderIndex ? "text-white" : ""}>{s.weeklyHours}h</span>
          ))}
        </div>
      </div>
    </div>
  );
}
