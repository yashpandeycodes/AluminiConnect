import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { goalService } from "@/services/goalService";
import { UpdateGoalSchema } from "@/validators/goalValidators";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const result = UpdateGoalSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });

    const updateResult = await goalService.updateGoal(session.user.id, id, result.data);
    if (!updateResult.success) {
      if (updateResult.error?.code === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
      if (updateResult.error?.code === "UNAUTHORIZED") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({ error: updateResult.error?.message }, { status: 500 });
    }
    
    return NextResponse.json({ data: updateResult.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const deleteResult = await goalService.deleteGoal(session.user.id, id);
    if (!deleteResult.success) {
      if (deleteResult.error?.code === "NOT_FOUND") return NextResponse.json({ error: "Not Found" }, { status: 404 });
      if (deleteResult.error?.code === "UNAUTHORIZED") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({ error: deleteResult.error?.message }, { status: 500 });
    }
    
    return NextResponse.json({ data: deleteResult.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
