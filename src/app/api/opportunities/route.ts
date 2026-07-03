import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { opportunityService } from "@/services/opportunityService";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const company = searchParams.get("company");
  const role = searchParams.get("role");

  const filters: import("@prisma/client").Prisma.OpportunityWhereInput = {};
  if (company) filters.company = { contains: company, mode: 'insensitive' };
  if (role) filters.role = { contains: role, mode: 'insensitive' };

  try {
    const result = await opportunityService.listOpportunities(filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch opportunities" } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await opportunityService.createOpportunity(session.user.id, session.user.role, body);
    
    if (!result.success) {
      const status = result.error?.code === "FORBIDDEN" ? 403 : (result.error?.code === "VALIDATION_ERROR" ? 400 : 500);
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to process request" } }, { status: 500 });
  }
}
