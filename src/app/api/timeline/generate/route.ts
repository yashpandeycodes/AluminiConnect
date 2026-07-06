import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { timelineService } from "@/services/timelineService";
import { GenerateTimelineSchema } from "@/validators/timelineValidators";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const parsed = GenerateTimelineSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed", issues: parsed.error.issues }, { status: 400 });

    const result = await timelineService.generateTimeline(session.user.id, parsed.data.weeklyHours);
    if (!result.success) {
      if (result.error?.code === "CONFLICT") return NextResponse.json({ error: result.error.message }, { status: 409 });
      return NextResponse.json({ error: result.error?.message }, { status: 500 });
    }

    return NextResponse.json({ data: result.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
