import React from "react";

export function SectionHeader({ title, subtitle, action }: { title: string, subtitle?: string, action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
