import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/reports
 * List reports with filtering, sorting, and pagination.
 *
 * Query params:
 * - type: filter by report type
 * - sortBy: field to sort by (default: "createdAt")
 * - sortOrder: "asc" | "desc" (default: "desc")
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const type = searchParams.get("type");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (type) {
            where.type = type;
        }

        // Execute queries in parallel
        const [reports, totalCount] = await Promise.all([
            prisma.report.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.report.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: reports,
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
        console.error("[API] GET /api/reports error:", message);
        return NextResponse.json(
            { error: "Failed to fetch reports", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reports
 * Create a new report record.
 *
 * Body: {
 *   name: string (required),
 *   type: string (required),
 *   tenantId: string (required),
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.name) {
            return NextResponse.json(
                { error: "Missing required field: name" },
                { status: 400 }
            );
        }

        if (!body.type) {
            return NextResponse.json(
                { error: "Missing required field: type" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const report = await prisma.report.create({
            data: body,
        });

        return NextResponse.json(
            {
                success: true,
                data: report,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/reports error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Report with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create report", details: message },
            { status: 500 }
        );
    }
}
