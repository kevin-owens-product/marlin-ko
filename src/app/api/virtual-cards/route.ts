import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/virtual-cards
 * List virtual cards with filtering, sorting, and pagination.
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
        const [cards, totalCount] = await Promise.all([
            prisma.virtualCard.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.virtualCard.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: cards,
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
        console.error("[API] GET /api/virtual-cards error:", message);
        return NextResponse.json(
            { error: "Failed to fetch virtual cards", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/virtual-cards
 * Create a new virtual card record.
 *
 * Body: {
 *   supplierId: string (required),
 *   cardNumber: string (required),
 *   amount: number (required),
 *   expiresAt: string (required),
 *   tenantId: string (required),
 *   status?: string,
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.supplierId) {
            return NextResponse.json(
                { error: "Missing required field: supplierId" },
                { status: 400 }
            );
        }

        if (!body.cardNumber) {
            return NextResponse.json(
                { error: "Missing required field: cardNumber" },
                { status: 400 }
            );
        }

        if (body.amount === undefined || body.amount === null) {
            return NextResponse.json(
                { error: "Missing required field: amount" },
                { status: 400 }
            );
        }

        if (!body.expiresAt) {
            return NextResponse.json(
                { error: "Missing required field: expiresAt" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const card = await prisma.virtualCard.create({
            data: {
                ...body,
                amount: parseFloat(body.amount),
                expiresAt: new Date(body.expiresAt),
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: card,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/virtual-cards error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Virtual card with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create virtual card", details: message },
            { status: 500 }
        );
    }
}
