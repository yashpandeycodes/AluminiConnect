import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: { code: "MISSING_TOKEN", message: "Verification token is required." } }, { status: 400 });
    }

    const result = await authService.verifyEmail(token);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, message: "Email verified successfully." }, { status: 200 });
  } catch (error) {
    console.error("Verification route error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
