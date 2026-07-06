import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { careerStateService } from "@/services/careerStateService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const result = await careerStateService.refreshCareerState(session.user.id);
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET career-state error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch career state" } }, { status: 500 });
  }
}
