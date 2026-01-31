import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/suppliers
 * List suppliers with filtering, sorting, and pagination.
 *
 * Query params:
 * - search: search by name (partial match)
 * - category: filter by category
 * - complianceStatus: filter by compliance status
 * - sortBy: field to sort by (default: "createdAt")
 * - sortOrder: "asc" | "desc" (default: "desc")
 * - page: page number (default: 1)
 * - limit: items per page (default: 20, max: 100)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;

        // Parse query parameters
        const search = searchParams.get("search");
        const category = searchParams.get("category");
        const complianceStatus = searchParams.get("complianceStatus");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (search) {
            where.name = {
                contains: search,
                mode: "insensitive",
            };
        }

        if (category) {
            where.category = category;
        }

        if (complianceStatus) {
            where.complianceStatus = complianceStatus;
        }

        // Execute queries in parallel
        const [suppliers, totalCount] = await Promise.all([
            prisma.tradingPartner.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.tradingPartner.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: suppliers,
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
        console.error("[API] GET /api/suppliers error:", message);
        return NextResponse.json(
            { error: "Failed to fetch suppliers", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/suppliers
 * Create a new supplier record.
 *
 * Body: {
 *   name: string (required),
 *   category?: string,
 *   complianceStatus?: string,
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

        const supplier = await prisma.tradingPartner.create({
            data: body,
        });

        return NextResponse.json(
            {
                success: true,
                data: supplier,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/suppliers error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Supplier with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create supplier", details: message },
            { status: 500 }
        );
    }
}
