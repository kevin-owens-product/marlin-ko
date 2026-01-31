import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/suppliers/[id]
 * Retrieve a single supplier by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const supplier = await prisma.tradingPartner.findUnique({
            where: { id },
        });

        if (!supplier) {
            return NextResponse.json(
                { error: "Supplier not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: supplier });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/suppliers/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch supplier", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/suppliers/[id]
 * Update an existing supplier.
 *
 * Body: Partial supplier fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if supplier exists
        const existing = await prisma.tradingPartner.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Supplier not found" },
                { status: 404 }
            );
        }

        const supplier = await prisma.tradingPartner.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: supplier,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/suppliers/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update supplier", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/suppliers/[id]
 * Delete a supplier by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if supplier exists
        const existing = await prisma.tradingPartner.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Supplier not found" },
                { status: 404 }
            );
        }

        await prisma.tradingPartner.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Supplier " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/suppliers/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete supplier", details: message },
            { status: 500 }
        );
    }
}
