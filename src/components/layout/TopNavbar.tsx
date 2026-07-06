"use client";

import React, { useState } from "react";
import { Search, Bell, Moon, Sun, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export function TopNavbar() {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(true); // Placeholder for actual theme hook

  // Helper to get workspace title from pathname
  const segments = pathname.split("/").filter(Boolean);
  let title = "Home";
  if (segments.length > 2) {
    title = segments[segments.length - 1]
      .split("-")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0a0a] flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-gray-500 dark:text-gray-400 hidden md:inline">Career OS</span>
        <span className="text-gray-400 dark:text-gray-600 hidden md:inline">/</span>
        <span className="text-gray-900 dark:text-white">{title}</span>
      </div>

      {/* Center & Right: Search, AI, Profile */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        
        {/* Search */}
        <div className="hidden md:flex relative group">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-1.5 w-64 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all dark:text-white"
          />
        </div>

        {/* Global AI Command Center (Hackathon Highlight) */}
        <button 
          onClick={() => alert("Coming Soon: AI Copilot will be available in Sprint 19.")}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 rounded-lg text-sm font-medium text-indigo-700 dark:text-indigo-300 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          <span>Ask Career AI...</span>
        </button>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 hidden sm:block"></div>

        {/* Actions */}
        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white dark:border-[#0a0a0a] shadow-sm ml-2 cursor-pointer"></div>
      </div>
    </header>
  );
}
