import { NextResponse } from "next/server";
import { authService } from "@/services/authService";

// This route should ideally be protected by a cron secret to prevent unauthorized access
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Unauthorized." } }, { status: 401 });
    }

    const result = await authService.autoTransitionRoles();
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error("Cron route error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
