import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiCareerService } from "@/services/aiCareerService";
import { z } from "zod";

const referralMessageSchema = z.object({
  studentInfo: z.string().min(10, "Student info is required."),
  opportunityInfo: z.string().min(10, "Opportunity info is required.")
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = referralMessageSchema.parse(body);

    const result = await aiCareerService.generateReferralMessage(parsed.studentInfo, parsed.opportunityInfo);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } }, { status: 400 });
    }
    console.error("Referral message route error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process request" } }, { status: 500 });
  }
}
