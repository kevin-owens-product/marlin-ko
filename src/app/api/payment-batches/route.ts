import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/payment-batches
 * List payment batches with filtering, sorting, and pagination.
 *
 * Query params:
 * - status: filter by status
 * - method: filter by payment method
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
        const method = searchParams.get("method");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (status) {
            where.status = status;
        }

        if (method) {
            where.method = method;
        }

        // Execute queries in parallel
        const [batches, totalCount] = await Promise.all([
            prisma.paymentBatch.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.paymentBatch.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: batches,
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
        console.error("[API] GET /api/payment-batches error:", message);
        return NextResponse.json(
            { error: "Failed to fetch payment batches", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/payment-batches
 * Create a new payment batch record.
 *
 * Body: {
 *   totalAmount: number (required),
 *   paymentCount: number (required),
 *   method: string (required),
 *   tenantId: string (required),
 *   status?: string,
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (body.totalAmount === undefined || body.totalAmount === null) {
            return NextResponse.json(
                { error: "Missing required field: totalAmount" },
                { status: 400 }
            );
        }

        if (body.paymentCount === undefined || body.paymentCount === null) {
            return NextResponse.json(
                { error: "Missing required field: paymentCount" },
                { status: 400 }
            );
        }

        if (!body.method) {
            return NextResponse.json(
                { error: "Missing required field: method" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const batch = await prisma.paymentBatch.create({
            data: {
                ...body,
                totalAmount: parseFloat(body.totalAmount),
                paymentCount: parseInt(body.paymentCount, 10),
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: batch,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/payment-batches error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Payment batch with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create payment batch", details: message },
            { status: 500 }
        );
    }
}
