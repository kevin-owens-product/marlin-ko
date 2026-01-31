import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/expenses
 * List expenses with filtering, sorting, and pagination.
 *
 * Query params:
 * - status: filter by status
 * - userId: filter by user ID
 * - category: filter by category
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
        const userId = searchParams.get("userId");
        const category = searchParams.get("category");
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (status) {
            where.status = status;
        }

        if (userId) {
            where.userId = userId;
        }

        if (category) {
            where.category = category;
        }

        // Execute queries in parallel
        const [expenses, totalCount] = await Promise.all([
            prisma.expense.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.expense.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: expenses,
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
        console.error("[API] GET /api/expenses error:", message);
        return NextResponse.json(
            { error: "Failed to fetch expenses", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/expenses
 * Create a new expense record.
 *
 * Body: {
 *   userId: string (required),
 *   category: string (required),
 *   amount: number (required),
 *   expenseDate: string (required),
 *   tenantId: string (required),
 *   status?: string,
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.userId) {
            return NextResponse.json(
                { error: "Missing required field: userId" },
                { status: 400 }
            );
        }

        if (!body.category) {
            return NextResponse.json(
                { error: "Missing required field: category" },
                { status: 400 }
            );
        }

        if (body.amount === undefined || body.amount === null) {
            return NextResponse.json(
                { error: "Missing required field: amount" },
                { status: 400 }
            );
        }

        if (!body.expenseDate) {
            return NextResponse.json(
                { error: "Missing required field: expenseDate" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        const expense = await prisma.expense.create({
            data: {
                ...body,
                amount: parseFloat(body.amount),
                expenseDate: new Date(body.expenseDate),
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: expense,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/expenses error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "Expense with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create expense", details: message },
            { status: 500 }
        );
    }
}
