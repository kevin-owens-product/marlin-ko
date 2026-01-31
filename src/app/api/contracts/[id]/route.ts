import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/contracts/[id]
 * Retrieve a single contract by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const contract = await prisma.contract.findUnique({
            where: { id },
        });

        if (!contract) {
            return NextResponse.json(
                { error: "Contract not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: contract });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/contracts/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch contract", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/contracts/[id]
 * Update an existing contract.
 *
 * Body: Partial contract fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if contract exists
        const existing = await prisma.contract.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Contract not found" },
                { status: 404 }
            );
        }

        // Parse numeric and date fields if provided
        if (body.value !== undefined) {
            body.value = parseFloat(body.value);
        }
        if (body.startDate !== undefined) {
            body.startDate = new Date(body.startDate);
        }
        if (body.endDate !== undefined) {
            body.endDate = new Date(body.endDate);
        }

        const contract = await prisma.contract.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: contract,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/contracts/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update contract", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/contracts/[id]
 * Delete a contract by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if contract exists
        const existing = await prisma.contract.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Contract not found" },
                { status: 404 }
            );
        }

        // Prevent deletion of active contracts
        if (existing.status === "active") {
            return NextResponse.json(
                { error: "Cannot delete contract with status: " + existing.status },
                { status: 409 }
            );
        }

        await prisma.contract.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Contract " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/contracts/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete contract", details: message },
            { status: 500 }
        );
    }
}
