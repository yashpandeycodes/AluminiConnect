import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { goalService } from "@/services/goalService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const result = await goalService.fetchActiveGoal(session.user.id);
    if (!result.success) {
      if (result.error?.code === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
      return NextResponse.json({ error: result.error?.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
