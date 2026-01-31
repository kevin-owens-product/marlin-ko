import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/approval-workflows
 * List approval workflows with filtering, sorting, and pagination.
 *
 * Query params:
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
        const isActive = searchParams.get("isActive");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (isActive !== null) {
            where.isActive = isActive === "true";
        }

        // Execute queries in parallel
        const [workflows, totalCount] = await Promise.all([
            prisma.approvalWorkflow.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.approvalWorkflow.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: workflows,
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
        console.error("[API] GET /api/approval-workflows error:", message);
        return NextResponse.json(
            { error: "Failed to fetch approval workflows", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/approval-workflows
 * Create a new approval workflow record.
 *
 * Body: {
 *   name: string (required),
 *   tenantId: string (required),
 *   isActive?: boolean,
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

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const workflow = await prisma.approvalWorkflow.create({
            data: body,
        });

        return NextResponse.json(
            {
                success: true,
                data: workflow,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/approval-workflows error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Approval workflow with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create approval workflow", details: message },
            { status: 500 }
        );
    }
}
