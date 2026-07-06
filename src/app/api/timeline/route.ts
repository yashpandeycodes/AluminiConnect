import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { timelineService } from "@/services/timelineService";
import { DynamicTimelineView, TimelineData } from "@/types/timeline";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await timelineService.getActiveTimeline(session.user.id);
    if (!result.success) {
      if (result.error?.code === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
      return NextResponse.json({ error: result.error?.message }, { status: 500 });
    }
    if (!result.data) {
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

    const timelineData = result.data.timeline as unknown as TimelineData;
    const now = new Date();
    
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const endOfWeek = new Date(startOfToday);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

    const dynamicView: DynamicTimelineView = {
      today: [],
      thisWeek: [],
      future: [],
      overdue: [],
      statistics: timelineData.statistics
    };

    for (const m of timelineData.missions) {
      const startDate = new Date(m.startDate);
      const endDate = new Date(m.endDate);

      // Overdue: endDate is entirely before today
      if (endDate < startOfToday) {
         dynamicView.overdue.push(m);
      } else {
        // Today: starts before end of today (and hasn't ended before today)
        if (startDate < endOfToday) {
          dynamicView.today.push(m);
        }
  
        // This week: starts before end of week
        if (startDate < endOfWeek) {
          dynamicView.thisWeek.push(m);
        }
  
        // Future: starts on or after end of week
        if (startDate >= endOfWeek) {
          dynamicView.future.push(m);
        }
      }
    }

    return NextResponse.json({ 
       data: {
         ...result.data,
         timeline: dynamicView 
       } 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
