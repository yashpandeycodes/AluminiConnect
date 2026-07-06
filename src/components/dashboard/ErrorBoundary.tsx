"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in dashboard component:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-red-200 bg-red-50 rounded-xl text-red-600 dark:bg-red-950/20 dark:border-red-900/50">
          <AlertCircle className="w-8 h-8 mb-2" />
          <h3 className="font-semibold text-sm">Failed to load component</h3>
          <p className="text-xs opacity-80 mt-1">Please try refreshing the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
