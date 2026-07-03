import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { opportunityService } from "@/services/opportunityService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing opportunity ID" } }, { status: 400 });
  }

  try {
    const result = await opportunityService.getOpportunity(id);
    
    if (!result.success) {
      const status = result.error?.code === "NOT_FOUND" ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch opportunity" } }, { status: 500 });
  }
}
