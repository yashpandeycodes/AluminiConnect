import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { careerStateService } from "@/services/careerStateService";
import { rebuildCareerStateSchema } from "@/validators/careerStateValidators";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    const parsed = rebuildCareerStateSchema.parse(body);

    const result = await careerStateService.rebuildCareerState(session.user.id, parsed.analysisSource, parsed.targetRole);
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } }, { status: 400 });
    }
    console.error("POST career-state/rebuild error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to rebuild career state" } }, { status: 500 });
  }
}
