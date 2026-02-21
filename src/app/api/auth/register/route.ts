import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "medius-dev-secret-change-in-production"
);

/**
 * Hash a password using Web Crypto API (PBKDF2 + SHA-256).
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  const hashArray = new Uint8Array(derivedBits);
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const hashHex = Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${saltHex}:${hashHex}`;
}

/**
 * POST /api/auth/register
 *
 * Body: { email, name, password, tenantName?, inviteToken? }
 *
 * If inviteToken is provided the user joins an existing tenant with the role
 * encoded in the token. Otherwise, if tenantName is provided a new tenant is
 * created and the user is assigned the ADMIN role.
 *
 * Returns: { success: true, data: { user, token } }
 * Returns 409 if the email is already registered.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, tenantName, inviteToken } = body as {
      email?: string;
      name?: string;
      password?: string;
      tenantName?: string;
      inviteToken?: string;
    };

    // ── Validate required fields ─────────────────────────────────
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Email, name, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Check for existing user ──────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Hash password ────────────────────────────────────────────
    const passwordHash = await hashPassword(password);

    let tenantId: string;
    let role = "VIEWER";

    if (inviteToken) {
      // ── Invite flow: decode token to find tenant + role ────────
      // In a real implementation this would verify a signed invite token.
      // For now we treat the invite token as a simple JSON-base64:
      // base64({ tenantId, role })
      try {
        const decoded = JSON.parse(
          Buffer.from(inviteToken, "base64").toString("utf-8")
        );

        if (!decoded.tenantId) {
          return NextResponse.json(
            { success: false, error: "Invalid invite token" },
            { status: 400 }
          );
        }

        // Verify tenant exists
        const tenant = await prisma.tenant.findUnique({
          where: { id: decoded.tenantId },
        });

        if (!tenant) {
          return NextResponse.json(
            { success: false, error: "Invalid invite token" },
            { status: 400 }
          );
        }

        tenantId = decoded.tenantId;
        role = decoded.role || "VIEWER";
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid invite token" },
          { status: 400 }
        );
      }
    } else if (tenantName) {
      // ── New tenant flow ────────────────────────────────────────
      const slug = tenantName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      // Check slug uniqueness — append random suffix if taken
      let finalSlug = slug;
      const existingTenant = await prisma.tenant.findUnique({
        where: { slug },
      });
      if (existingTenant) {
        finalSlug = `${slug}-${crypto.randomUUID().slice(0, 8)}`;
      }

      const tenant = await prisma.tenant.create({
        data: {
          name: tenantName,
          slug: finalSlug,
          plan: "PROFESSIONAL",
        },
      });

      tenantId = tenant.id;
      role = "ADMIN";
    } else {
      return NextResponse.json(
        {
          success: false,
          error:
            "Either tenantName (to create a new organization) or inviteToken (to join an existing one) is required",
        },
        { status: 400 }
      );
    }

    // ── Create user ──────────────────────────────────────────────
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        role,
        tenantId,
        isActive: true,
      },
    });

    // ── Create JWT ───────────────────────────────────────────────
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // ── Persist session ──────────────────────────────────────────
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    // ── Set cookie and respond ───────────────────────────────────
    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      },
      { status: 201 }
    );

    response.cookies.set("medius_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[API] POST /api/auth/register error:", message);

    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
