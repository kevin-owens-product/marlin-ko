import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/users
 * List users with filtering, sorting, and pagination.
 *
 * Query params:
 * - role: filter by role
 * - isActive: filter by active status ("true" or "false")
 * - sortBy: field to sort by (default: "createdAt")
 * - sortOrder: "asc" | "desc" (default: "desc")
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const role = searchParams.get("role");
        const isActive = searchParams.get("isActive");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (role) {
            where.role = role;
        }

        if (isActive !== null) {
            where.isActive = isActive === "true";
        }

        // Execute queries in parallel
        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.user.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: users,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/users error:", message);
        return NextResponse.json(
            { error: "Failed to fetch users", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/users
 * Create a new user record.
 *
 * Body: {
 *   email: string (required, unique),
 *   name: string (required),
 *   role: string (required),
 *   tenantId: string (required),
 *   isActive?: boolean,
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.email) {
            return NextResponse.json(
                { error: "Missing required field: email" },
                { status: 400 }
            );
        }

        if (!body.name) {
            return NextResponse.json(
                { error: "Missing required field: name" },
                { status: 400 }
            );
        }

        if (!body.role) {
            return NextResponse.json(
                { error: "Missing required field: role" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const user = await prisma.user.create({
            data: body,
        });

        return NextResponse.json(
            {
                success: true,
                data: user,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/users error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create user", details: message },
            { status: 500 }
        );
    }
}
