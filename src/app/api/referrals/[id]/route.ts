import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { referralService } from "@/services/referralService";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing referral ID" } }, { status: 400 });
  }

  try {
    const body = await req.json();
    const result = await referralService.updateReferralStatus(session.user.id, id, body);
    
    if (!result.success) {
      const status = result.error?.code === "NOT_FOUND" ? 404 : (result.error?.code === "FORBIDDEN" ? 403 : (result.error?.code === "VALIDATION_ERROR" ? 400 : 500));
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process request" } }, { status: 500 });
  }
}
