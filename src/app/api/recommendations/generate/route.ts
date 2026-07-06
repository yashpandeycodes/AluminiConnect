import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { recommendationService } from "@/services/recommendationService";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await recommendationService.generateRecommendationSet(session.user.id);
    if (!result.success) {
      if (result.error?.code === "CONFLICT") return NextResponse.json({ error: result.error.message }, { status: 409 });
      return NextResponse.json({ error: result.error?.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
