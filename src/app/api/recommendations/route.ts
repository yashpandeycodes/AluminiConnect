import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { recommendationService } from "@/services/recommendationService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await recommendationService.listActiveRecommendations(session.user.id);
    if (!result.success) return NextResponse.json({ error: result.error?.message }, { status: 500 });

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
