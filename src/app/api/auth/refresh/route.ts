import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

/**
 * POST /api/auth/refresh
 *
 * Refresh an authentication token. Reads the current token from the
 * `medius_session` cookie or the `Authorization: Bearer <token>` header.
 *
 * If the token is still valid (not expired) the endpoint:
 * 1. Issues a new JWT with an extended expiry (24 hours).
 * 2. Updates the corresponding Session record in the database.
 * 3. Sets the new token in the `medius_session` httpOnly cookie.
 *
 * Returns: { success: true, data: { token, expiresAt } }
 */
export async function POST(request: NextRequest) {
  try {
    // ── Extract token from cookie or Authorization header ─────
    let token = request.cookies.get("medius_session")?.value;

    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No session token provided" },
        { status: 401 }
      );
    }

    // ── Verify current token ──────────────────────────────────
    let payload: {
      userId: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
    };

    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload as typeof payload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // ── Verify session still exists in database ───────────────
    let existingSession;
    try {
      existingSession = await prisma.session.findUnique({
        where: { token },
      });
    } catch {
      // Session table might not exist in demo mode; allow refresh
      existingSession = null;
    }

    if (existingSession && existingSession.expiresAt < new Date()) {
      // Session has expired in the database — clean up and reject
      try {
        await prisma.session.delete({ where: { token } });
      } catch {
        // Ignore cleanup failures
      }
      return NextResponse.json(
        { success: false, error: "Session has expired. Please log in again." },
        { status: 401 }
      );
    }

    // ── Issue new token ───────────────────────────────────────
    const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const newToken = await new SignJWT({
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tenantId: payload.tenantId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // ── Update session in database ────────────────────────────
    try {
      if (existingSession) {
        await prisma.session.update({
          where: { id: existingSession.id },
          data: {
            token: newToken,
            expiresAt: newExpiresAt,
          },
        });
      } else {
        // Create a new session if one did not exist (e.g., demo user)
        await prisma.session.create({
          data: {
            userId: payload.userId,
            token: newToken,
            expiresAt: newExpiresAt,
            ipAddress:
              request.headers.get("x-forwarded-for") ||
              request.headers.get("x-real-ip") ||
              null,
            userAgent: request.headers.get("user-agent") || null,
          },
        });
      }
    } catch {
      // Session persistence failure should not block token refresh
      console.warn("[API] POST /api/auth/refresh: failed to persist session");
    }

    // ── Build response ────────────────────────────────────────
    const response = NextResponse.json(
      {
        success: true,
        data: {
          token: newToken,
          expiresAt: newExpiresAt.toISOString(),
        },
      },
      { status: 200 }
    );

    response.cookies.set("medius_session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/auth/refresh error:", message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
