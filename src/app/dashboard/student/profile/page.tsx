import React from "react";
import { UserCircle, Save, Plus } from "lucide-react";
import { SectionHeader } from "@/components/dashboard/SectionHeader";

export default function ProfileWorkspace() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Workspace</h1>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <SectionHeader title="Personal Details" />
            <p className="text-gray-500 text-sm mb-4">Update your core identity and contact details.</p>
            {/* Form Placeholder */}
            <div className="h-32 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
              <span className="text-gray-400">Settings Form Module</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111111] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <SectionHeader title="Social Links" />
            <button className="w-full mt-4 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-gray-300">
              <Plus className="w-4 h-4" />
              Add LinkedIn
            </button>
            <button className="w-full mt-2 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 py-2 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-gray-300">
              <Plus className="w-4 h-4" />
              Add GitHub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
