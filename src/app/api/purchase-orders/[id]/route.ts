import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/purchase-orders/[id]
 * Retrieve a single purchase order by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!purchaseOrder) {
            return NextResponse.json(
                { error: "Purchase order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: purchaseOrder });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/purchase-orders/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch purchase order", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/purchase-orders/[id]
 * Update an existing purchase order.
 *
 * Body: Partial purchase order fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if purchase order exists
        const existing = await prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Purchase order not found" },
                { status: 404 }
            );
        }

        // Parse totalAmount if provided
        if (body.totalAmount !== undefined) {
            body.totalAmount = parseFloat(body.totalAmount);
        }

        const purchaseOrder = await prisma.purchaseOrder.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: purchaseOrder,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/purchase-orders/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update purchase order", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/purchase-orders/[id]
 * Delete a purchase order by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if purchase order exists
        const existing = await prisma.purchaseOrder.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Purchase order not found" },
                { status: 404 }
            );
        }

        // Prevent deletion of completed or received purchase orders
        if (existing.status === "completed" || existing.status === "received") {
            return NextResponse.json(
                { error: "Cannot delete purchase order with status: " + existing.status },
                { status: 409 }
            );
        }

        await prisma.purchaseOrder.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Purchase order " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/purchase-orders/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete purchase order", details: message },
            { status: 500 }
        );
    }
}
