import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/virtual-cards/[id]
 * Retrieve a single virtual card by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const card = await prisma.virtualCard.findUnique({
            where: { id },
        });

        if (!card) {
            return NextResponse.json(
                { error: "Virtual card not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: card });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/virtual-cards/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch virtual card", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/virtual-cards/[id]
 * Update an existing virtual card.
 *
 * Body: Partial virtual card fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if virtual card exists
        const existing = await prisma.virtualCard.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Virtual card not found" },
                { status: 404 }
            );
        }

        // Parse numeric and date fields if provided
        if (body.amount !== undefined) {
            body.amount = parseFloat(body.amount);
        }
        if (body.expiresAt !== undefined) {
            body.expiresAt = new Date(body.expiresAt);
        }

        const card = await prisma.virtualCard.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: card,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/virtual-cards/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update virtual card", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/virtual-cards/[id]
 * Delete a virtual card by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if virtual card exists
        const existing = await prisma.virtualCard.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Virtual card not found" },
                { status: 404 }
            );
        }

        // Prevent deletion of used virtual cards
        if (existing.status === "used" || existing.status === "redeemed") {
            return NextResponse.json(
                { error: "Cannot delete virtual card with status: " + existing.status },
                { status: 409 }
            );
        }

        await prisma.virtualCard.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Virtual card " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/virtual-cards/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete virtual card", details: message },
            { status: 500 }
        );
    }
}
