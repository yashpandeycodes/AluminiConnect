import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { alumniSearchService, AlumniSearchParams } from "@/services/alumniSearchService";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  
  const filters: AlumniSearchParams = {};
  
  const company = searchParams.get("company");
  if (company) filters.company = company;
  
  const role = searchParams.get("role");
  if (role) filters.role = role;
  
  const industry = searchParams.get("industry");
  if (industry) filters.industry = industry;
  
  const department = searchParams.get("department");
  if (department) filters.department = department;
  
  const graduationYear = searchParams.get("graduationYear");
  if (graduationYear && !isNaN(parseInt(graduationYear))) {
    filters.graduationYear = parseInt(graduationYear);
  }

  try {
    const result = await alumniSearchService.searchAlumni(session.user.id, filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Alumni search error:", error);
    return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Failed to search alumni" } }, { status: 500 });
  }
}
