import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/scf-programs
 * List SCF programs with filtering, sorting, and pagination.
 *
 * Query params:
 * - status: filter by status
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
        const sortBy = searchParams.get("sortBy") || "createdAt";
        const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

        // Build where clause
        const where: Record<string, any> = {};

        if (status) {
            where.status = status;
        }

        // Execute queries in parallel
        const [programs, totalCount] = await Promise.all([
            prisma.sCFProgram.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.sCFProgram.count({ where }),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return NextResponse.json({
            data: programs,
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
        console.error("[API] GET /api/scf-programs error:", message);
        return NextResponse.json(
            { error: "Failed to fetch SCF programs", details: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/scf-programs
 * Create a new SCF program record.
 *
 * Body: {
 *   funder: string (required),
 *   programSize: number (required),
 *   tenantId: string (required),
 *   rateRangeMin: number (required),
 *   rateRangeMax: number (required),
 *   status?: string,
 *   ...other fields
 * }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.funder) {
            return NextResponse.json(
                { error: "Missing required field: funder" },
                { status: 400 }
            );
        }

        if (body.programSize === undefined || body.programSize === null) {
            return NextResponse.json(
                { error: "Missing required field: programSize" },
                { status: 400 }
            );
        }

        if (!body.tenantId) {
            return NextResponse.json(
                { error: "Missing required field: tenantId" },
                { status: 400 }
            );
        }

        if (body.rateRangeMin === undefined || body.rateRangeMin === null) {
            return NextResponse.json(
                { error: "Missing required field: rateRangeMin" },
                { status: 400 }
            );
        }

        if (body.rateRangeMax === undefined || body.rateRangeMax === null) {
            return NextResponse.json(
                { error: "Missing required field: rateRangeMax" },
                { status: 400 }
            );
        }

        const program = await prisma.sCFProgram.create({
            data: {
                ...body,
                programSize: parseFloat(body.programSize),
                rateRangeMin: parseFloat(body.rateRangeMin),
                rateRangeMax: parseFloat(body.rateRangeMax),
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: program,
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] POST /api/scf-programs error:", message);

        if (message.includes("Unique constraint")) {
            return NextResponse.json(
                { error: "SCF program with this identifier already exists" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: "Failed to create SCF program", details: message },
            { status: 500 }
        );
    }
}
