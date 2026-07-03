import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiCareerService } from "@/services/aiCareerService";
import { z } from "zod";

const resumeScoreSchema = z.object({
  resumeUrl: z.string().url("Must provide a valid resume URL.").optional(),
  pdfBase64: z.string().optional(),
  resumeText: z.string().optional(),
  targetRole: z.string().min(2, "Target role is required.")
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = resumeScoreSchema.parse(body);

    if (!parsed.resumeUrl && !parsed.resumeText && !parsed.pdfBase64) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: "Either resumeUrl, pdfBase64, or resumeText is required." } }, { status: 400 });
    }

    if (parsed.pdfBase64) {
      const result = await aiCareerService.scoreResumePdf(parsed.pdfBase64, parsed.targetRole);
      
      if (!result.success) {
        return NextResponse.json(result, { status: 500 });
      }

      return NextResponse.json(result, { status: 200 });
    }

    if (parsed.resumeUrl) {
      // Download the PDF from the URL
      const response = await fetch(parsed.resumeUrl);
      if (!response.ok) {
        return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch resume PDF from URL." } }, { status: 500 });
      }
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Data = buffer.toString("base64");
      
      const result = await aiCareerService.scoreResumePdf(base64Data, parsed.targetRole);
      
      if (!result.success) {
        return NextResponse.json(result, { status: 500 });
      }

      return NextResponse.json(result, { status: 200 });
    }

    const result = await aiCareerService.scoreResume(parsed.resumeText || "", parsed.targetRole);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues[0].message } }, { status: 400 });
    }
    console.error("Resume score route error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process request" } }, { status: 500 });
  }
}
