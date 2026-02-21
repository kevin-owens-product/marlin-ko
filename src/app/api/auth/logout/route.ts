import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * POST /api/auth/logout
 *
 * Clears the `medius_session` cookie and invalidates the session
 * record in the database (if one exists for the token).
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("medius_session")?.value;

    // ── Invalidate session in DB ─────────────────────────────────
    if (token) {
      try {
        await prisma.session.deleteMany({
          where: { token },
        });
      } catch {
        // Session may not exist (e.g., demo users) — that is fine
      }
    }

    // ── Clear the cookie ─────────────────────────────────────────
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    response.cookies.set("medius_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/auth/logout error:", message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
