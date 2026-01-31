import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/contracts
 * List contracts with filtering, sorting, and pagination.
 *
 * Query params:
 * - status: filter by status
 * - supplierId: filter by supplier ID
 * - sortBy: field to sort by (default: "createdAt")
 * - sortOrder: "asc" | "desc" (default: "desc")
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const status = searchParams.get("status");
        const supplierId = searchParams.get("supplierId");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (status) {
            where.status = status;
        }

        if (supplierId) {
            where.supplierId = supplierId;
        }

        // Execute queries in parallel
        const [contracts, totalCount] = await Promise.all([
            prisma.contract.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.contract.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: contracts,
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
        console.error("[API] GET /api/contracts error:", message);
        return NextResponse.json(
            { error: "Failed to fetch contracts", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/contracts
 * Create a new contract record.
 *
 * Body: {
 *   title: string (required),
 *   supplierId: string (required),
 *   value: number (required),
 *   startDate: string (required),
 *   endDate: string (required),
 *   tenantId: string (required),
 *   status?: string,
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.title) {
            return NextResponse.json(
                { error: "Missing required field: title" },
                { status: 400 }
            );
        }

        if (!body.supplierId) {
            return NextResponse.json(
                { error: "Missing required field: supplierId" },
                { status: 400 }
            );
        }

        if (body.value === undefined || body.value === null) {
            return NextResponse.json(
                { error: "Missing required field: value" },
                { status: 400 }
            );
        }

        if (!body.startDate) {
            return NextResponse.json(
                { error: "Missing required field: startDate" },
                { status: 400 }
            );
        }

        if (!body.endDate) {
            return NextResponse.json(
                { error: "Missing required field: endDate" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const contract = await prisma.contract.create({
            data: {
                ...body,
                value: parseFloat(body.value),
                startDate: new Date(body.startDate),
                endDate: new Date(body.endDate),
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: contract,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/contracts error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Contract with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create contract", details: message },
            { status: 500 }
        );
    }
}
