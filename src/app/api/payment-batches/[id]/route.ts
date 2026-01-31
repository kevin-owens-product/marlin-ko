import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/payment-batches/[id]
 * Retrieve a single payment batch by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const batch = await prisma.paymentBatch.findUnique({
            where: { id },
        });

        if (!batch) {
            return NextResponse.json(
                { error: "Payment batch not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: batch });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/payment-batches/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch payment batch", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/payment-batches/[id]
 * Update an existing payment batch.
 *
 * Body: Partial payment batch fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if payment batch exists
        const existing = await prisma.paymentBatch.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Payment batch not found" },
                { status: 404 }
            );
        }

        // Parse numeric fields if provided
        if (body.totalAmount !== undefined) {
            body.totalAmount = parseFloat(body.totalAmount);
        }
        if (body.paymentCount !== undefined) {
            body.paymentCount = parseInt(body.paymentCount, 10);
        }

        const batch = await prisma.paymentBatch.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: batch,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/payment-batches/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update payment batch", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/payment-batches/[id]
 * Delete a payment batch by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if payment batch exists
        const existing = await prisma.paymentBatch.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Payment batch not found" },
                { status: 404 }
            );
        }

        // Prevent deletion of processed or completed batches
        if (existing.status === "processed" || existing.status === "completed") {
            return NextResponse.json(
                { error: "Cannot delete payment batch with status: " + existing.status },
                { status: 409 }
            );
        }

        await prisma.paymentBatch.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Payment batch " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/payment-batches/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete payment batch", details: message },
            { status: 500 }
        );
    }
}
