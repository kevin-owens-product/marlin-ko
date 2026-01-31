import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/scf-programs/[id]
 * Retrieve a single SCF program by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const program = await prisma.sCFProgram.findUnique({
            where: { id },
        });

        if (!program) {
            return NextResponse.json(
                { error: "SCF program not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: program });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/scf-programs/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch SCF program", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/scf-programs/[id]
 * Update an existing SCF program.
 *
 * Body: Partial SCF program fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if SCF program exists
        const existing = await prisma.sCFProgram.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "SCF program not found" },
                { status: 404 }
            );
        }

        // Parse numeric fields if provided
        if (body.programSize !== undefined) {
            body.programSize = parseFloat(body.programSize);
        }
        if (body.rateRangeMin !== undefined) {
            body.rateRangeMin = parseFloat(body.rateRangeMin);
        }
        if (body.rateRangeMax !== undefined) {
            body.rateRangeMax = parseFloat(body.rateRangeMax);
        }

        const program = await prisma.sCFProgram.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: program,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/scf-programs/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update SCF program", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/scf-programs/[id]
 * Delete an SCF program by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if SCF program exists
        const existing = await prisma.sCFProgram.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "SCF program not found" },
                { status: 404 }
            );
        }

        // Prevent deletion of active SCF programs
        if (existing.status === "active") {
            return NextResponse.json(
                { error: "Cannot delete SCF program with status: " + existing.status },
                { status: 409 }
            );
        }

        await prisma.sCFProgram.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "SCF program " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/scf-programs/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete SCF program", details: message },
            { status: 500 }
        );
    }
}
