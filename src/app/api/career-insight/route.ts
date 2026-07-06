import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { careerInsightService } from "@/services/careerInsightService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const result = await careerInsightService.computeInsights(session.user.id);
    if (!result.success) {
      const status = result.error?.code === "NOT_FOUND" ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET career-insight error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch career insights" } }, { status: 500 });
  }
}
