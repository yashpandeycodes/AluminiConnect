import React, { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { dashboardService } from "@/services/dashboardService";

// Core Layout & Navigation
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";
import { LoadingSkeleton } from "@/components/dashboard/LoadingSkeleton";

// Feature Components (Moved from Single Page to Home View)
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { ProgressJourney } from "@/components/dashboard/ProgressJourney";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { MissionCard } from "@/components/dashboard/MissionCard";

export default async function StudentHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // The BFF Aggregator Call
  const result = await dashboardService.getDashboardData(session.user.id);

  if (!result.success) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl m-8">
        Failed to load workspace. {result.error?.message}
      </div>
    );
  }

  const dto = result.data;

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Onboarding & Progress */}
      <section>
        <ProgressJourney data={dto} />
      </section>

      {/* 2. Command Center Hero */}
      <section>
        <DashboardHero data={dto.hero} />
      </section>

      {/* 3. Action Hub */}
      <section>
        <QuickActions data={dto} />
      </section>

      {/* 4. Active Execution (Today's Priorities) */}
      <section className="grid grid-cols-1 gap-6">
        <ErrorBoundary>
          <MissionCard missions={dto.missions} />
        </ErrorBoundary>
      </section>

    </div>
  );
}
