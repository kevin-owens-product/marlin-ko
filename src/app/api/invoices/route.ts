import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/invoices
 * List invoices with filtering, sorting, and pagination.
 *
 * Query params:
 * - search: search across invoiceNumber and vendorName (partial match)
 * - status: filter by status (e.g., "extracted", "approved")
 * - vendor: filter by vendor name (partial match)
 * - minAmount / maxAmount: filter by amount range
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
        const status = searchParams.get("status");
        const vendor = searchParams.get("vendor");
        const minAmount = searchParams.get("minAmount");
        const maxAmount = searchParams.get("maxAmount");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (search) {
            where.OR = [
                {
                    invoiceNumber: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    vendorName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (vendor) {
            where.vendorName = {
                contains: vendor,
                mode: "insensitive",
            };
        }

        if (minAmount || maxAmount) {
            where.totalAmount = {};
            if (minAmount) {
                where.totalAmount.gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                where.totalAmount.lte = parseFloat(maxAmount);
            }
        }

        // Execute queries in parallel
        const [invoices, totalCount] = await Promise.all([
            prisma.invoice.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.invoice.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: invoices,
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
        console.error("[API] GET /api/invoices error:", message);
        return NextResponse.json(
            { error: "Failed to fetch invoices", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/invoices
 * Create a new invoice record.
 *
 * Body: {
 *   invoiceNumber: string,
 *   vendorName: string,
 *   totalAmount: number,
 *   currency?: string,
 *   sourceType?: string,
 *   dueDate?: string,
 *   lineItems?: Array<{ description, quantity, unitPrice, totalAmount }>
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.invoiceNumber) {
            return NextResponse.json(
                { error: "Missing required field: invoiceNumber" },
                { status: 400 }
            );
        }

        if (!body.vendorName) {
            return NextResponse.json(
                { error: "Missing required field: vendorName" },
                { status: 400 }
            );
        }

        if (body.totalAmount === undefined || body.totalAmount === null) {
            return NextResponse.json(
                { error: "Missing required field: totalAmount" },
                { status: 400 }
            );
        }

        const invoice = await prisma.invoice.create({
            data: {
                invoiceNumber: body.invoiceNumber,
                vendorName: body.vendorName,
                totalAmount: parseFloat(body.totalAmount),
                currency: body.currency || "USD",
                sourceType: body.sourceType || "upload",
                status: "ingested",
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
                rawFileRef: body.rawFileRef || null,
                confidence: body.confidence || null,
                lineItems: body.lineItems || undefined,
            } as any,
        });

        return NextResponse.json(
            {
                success: true,
                data: invoice,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/invoices error:", message);

        // Handle unique constraint violation
        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Invoice with this number already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create invoice", details: message },
            { status: 500 }
        );
    }
}
