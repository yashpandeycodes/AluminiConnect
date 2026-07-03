import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { hasRole } from "@/lib/rbac";

export default withAuth(
  function proxy(req) {
    const { pathname } = req.nextUrl;
    const userRole = req.nextauth.token?.role as string;

    // Admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      // Except cron which has its own protection
      if (!pathname.startsWith("/api/admin/cron") && !hasRole(userRole, ["ADMIN"])) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Alumni routes
    if (pathname.startsWith("/alumni")) {
      if (!hasRole(userRole, ["ALUMNI", "ADMIN"])) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }
    
    // Alumni API routes (e.g. search) should be accessible to students too
    if (pathname.startsWith("/api/alumni")) {
      if (!hasRole(userRole, ["STUDENT", "ALUMNI", "ADMIN"])) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Student routes
    if (pathname.startsWith("/student")) {
      if (!hasRole(userRole, ["STUDENT", "ADMIN"])) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/student/:path*",
    "/alumni/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/alumni/:path*",
    "/api/profile/:path*",
    "/api/opportunities/:path*",
    "/api/referrals/:path*",
    "/api/ai/:path*",
    "/api/contributions/:path*"
  ],
};
