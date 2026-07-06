"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  UserCircle, 
  FileText, 
  Activity, 
  Target, 
  Lightbulb, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  LineChart, 
  Settings 
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Home", href: "/dashboard/student", icon: LayoutDashboard },
  { name: "Profile", href: "/dashboard/student/profile", icon: UserCircle },
  { name: "Resume", href: "/dashboard/student/resume", icon: FileText },
  { name: "Career State", href: "/dashboard/student/career-state", icon: Activity },
  { name: "Goals", href: "/dashboard/student/goals", icon: Target },
  { name: "Recommendations", href: "/dashboard/student/recommendations", icon: Lightbulb },
  { name: "Mission Planner", href: "/dashboard/student/mission-planner", icon: CheckSquare },
  { name: "Timeline", href: "/dashboard/student/timeline", icon: Calendar },
  { name: "Analytics", href: "/dashboard/student/analytics", icon: TrendingUp },
  { name: "Predictions", href: "/dashboard/student/predictions", icon: LineChart },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex flex-col h-full sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-black dark:bg-white flex items-center justify-center mr-3">
          <span className="text-white dark:text-black font-bold text-lg leading-none">C</span>
        </div>
        <span className="font-bold text-gray-900 dark:text-white tracking-tight">Career OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white transition-colors">
          <Settings className="w-4 h-4 text-gray-500" />
          Settings
        </button>
      </div>
    </aside>
  );
}
