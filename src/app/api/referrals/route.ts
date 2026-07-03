import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { referralService } from "@/services/referralService";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  try {
    const result = await referralService.getMyReferrals(session.user.id, session.user.role);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch referrals" } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await referralService.requestReferral(session.user.id, session.user.role, body);
    
    if (!result.success) {
      const status = result.error?.code === "FORBIDDEN" ? 403 : (result.error?.code === "VALIDATION_ERROR" ? 400 : (result.error?.code === "CONFLICT" ? 409 : 500));
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process request" } }, { status: 500 });
  }
}
