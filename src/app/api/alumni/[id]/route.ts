import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { profileService } from "@/services/profileService";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ success: false, error: { code: "INVALID_REQUEST", message: "Missing user ID" } }, { status: 400 });
  }

  try {
    const result = await profileService.getPublicProfile(id);
    
    if (!result.success) {
      const status = result.error?.code === "NOT_FOUND" ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Public profile fetch error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch profile" } }, { status: 500 });
  }
}
