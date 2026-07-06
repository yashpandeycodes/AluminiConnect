import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { missionService } from "@/services/missionService";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const result = await missionService.cancelMission(session.user.id, id);
    if (!result.success) {
      if (result.error?.code === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
      return NextResponse.json({ error: result.error?.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
