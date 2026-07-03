import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { contributionService } from "@/services/contributionService";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  try {
    const result = await contributionService.getMyContributions(session.user.id);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { contributionScore: true }
    });

    return NextResponse.json({
        success: true,
        data: {
            score: user?.contributionScore || 0,
            history: result.data
        }
    }, { status: 200 });
  } catch (error) {
    console.error("My contributions route error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch contribution history." } }, { status: 500 });
  }
}
