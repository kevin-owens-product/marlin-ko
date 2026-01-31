import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/purchase-orders
 * List purchase orders with filtering, sorting, and pagination.
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
        const [purchaseOrders, totalCount] = await Promise.all([
            prisma.purchaseOrder.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.purchaseOrder.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: purchaseOrders,
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
        console.error("[API] GET /api/purchase-orders error:", message);
        return NextResponse.json(
            { error: "Failed to fetch purchase orders", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/purchase-orders
 * Create a new purchase order record.
 *
 * Body: {
 *   poNumber: string (required, unique),
 *   supplierId: string (required),
 *   totalAmount: number (required),
 *   tenantId: string (required),
 *   status?: string,
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.poNumber) {
            return NextResponse.json(
                { error: "Missing required field: poNumber" },
                { status: 400 }
            );
        }

        if (!body.supplierId) {
            return NextResponse.json(
                { error: "Missing required field: supplierId" },
                { status: 400 }
            );
        }

        if (body.totalAmount === undefined || body.totalAmount === null) {
            return NextResponse.json(
                { error: "Missing required field: totalAmount" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                ...body,
                totalAmount: parseFloat(body.totalAmount),
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: purchaseOrder,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/purchase-orders error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Purchase order with this PO number already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create purchase order", details: message },
            { status: 500 }
        );
    }
}
