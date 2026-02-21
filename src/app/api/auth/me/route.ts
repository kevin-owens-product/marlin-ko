import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import { DEMO_USERS } from "@/lib/auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

/**
 * GET /api/auth/me
 *
 * Reads the JWT from the `medius_session` cookie and returns the
 * current user information including tenant details.
 *
 * Returns 401 if not authenticated or token is expired.
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("medius_session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // ── Verify JWT ───────────────────────────────────────────────
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
        { success: false, error: "Invalid or expired session" },
        { status: 401 }
      );
    }

    // ── Check for demo user ──────────────────────────────────────
    const demoUser = Object.values(DEMO_USERS).find(
      (u) => u.id === payload.userId
    );

    if (demoUser) {
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            tenantId: demoUser.tenantId,
            tenant: {
              id: demoUser.tenantId,
              name: "Medius Demo",
              slug: "medius-demo",
              plan: "ENTERPRISE",
            },
          },
        },
      });
    }

    // ── Fetch full user from DB ──────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "User not found or inactive" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          avatarUrl: user.avatarUrl,
          tenant: user.tenant,
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] GET /api/auth/me error:", message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
