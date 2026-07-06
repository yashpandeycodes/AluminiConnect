import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { goalService } from "@/services/goalService";
import { CreateGoalSchema } from "@/validators/goalValidators";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = CreateGoalSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: "Validation failed", issues: result.error.issues }, { status: 400 });

    const createResult = await goalService.createGoal(session.user.id, result.data);
    if (!createResult.success) return NextResponse.json({ error: createResult.error?.message }, { status: 500 });
    
    return NextResponse.json({ data: createResult.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const listResult = await goalService.listGoals(session.user.id);
    if (!listResult.success) return NextResponse.json({ error: listResult.error?.message }, { status: 500 });

    return NextResponse.json({ data: listResult.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
