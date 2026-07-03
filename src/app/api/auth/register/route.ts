import { NextResponse } from "next/server";
import { registerSchema } from "@/validators/authValidators";
import { authService } from "@/services/authService";
import { rateLimitAuth } from "@/lib/rateLimit";
import { ZodError } from "zod";

export async function POST(req: Request) {
  try {
    // Basic IP-based rate limiting
    // In Next.js App Router, extracting IP can be tricky depending on the deployment platform.
    // X-Forwarded-For is common on Vercel.
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await rateLimitAuth(`register_${ip}`);
    
    if (!success) {
      return NextResponse.json({ error: { code: "RATE_LIMITED", message: "Too many requests. Please try again later." } }, { status: 429 });
    }

    const body = await req.json();
    const parsedData = registerSchema.parse(body);
    
    const result = await authService.registerUser(parsedData);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: error.issues[0].message } }, { status: 400 });
    }
    console.error("Registration route error:", error);
    return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
  }
}
