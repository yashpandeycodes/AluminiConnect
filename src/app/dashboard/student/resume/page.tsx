import React from "react";
import { UploadCloud, FileText, CheckCircle, RefreshCw } from "lucide-react";

export default function ResumeWorkspace() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Workspace</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors dark:text-gray-300">
            <RefreshCw className="w-4 h-4" />
            Regenerate Score
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <UploadCloud className="w-4 h-4" />
            Upload PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] p-10 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
        <FileText className="w-12 h-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Build or Upload Your Resume</h3>
        <p className="text-gray-500 max-w-md mb-6">
          Your resume is the foundation of your Career State. Upload your latest PDF or build one from your LinkedIn profile.
        </p>
        <div className="flex gap-4">
          <button className="bg-gray-900 text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
            Upload PDF
          </button>
          <button className="border border-gray-300 dark:border-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white">
            Import LinkedIn
          </button>
        </div>
      </div>

    </div>
  );
}
