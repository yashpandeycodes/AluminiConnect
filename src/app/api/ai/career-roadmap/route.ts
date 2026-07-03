import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiCareerService } from "@/services/aiCareerService";
import { z } from "zod";

const careerRoadmapSchema = z.object({
  currentSkills: z.array(z.string()).min(1, "At least one skill is required."),
  careerGoal: z.string().min(2, "Career goal is required.")
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = careerRoadmapSchema.parse(body);

    const result = await aiCareerService.generateCareerRoadmap(parsed.currentSkills, parsed.careerGoal);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } }, { status: 400 });
    }
    console.error("Career roadmap route error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process request" } }, { status: 500 });
  }
}
