import { NextResponse } from "next/server";
import { contributionService } from "@/services/contributionService";

export async function GET() {
  try {
    const result = await contributionService.getLeaderboard(100);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Contributions route error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch leaderboard." } }, { status: 500 });
  }
}
