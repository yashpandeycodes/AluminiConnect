import React from "react";
import { FolderPlus } from "lucide-react";

export function EmptyState({ title, message, actionText, onAction }: { title: string, message: string, actionText?: string, onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-800">
      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
        <FolderPlus className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">{message}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction}
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-black dark:bg-white dark:text-black rounded-lg hover:opacity-90 transition-opacity"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
