import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/invoices/[id]
 * Retrieve a single invoice by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const invoice = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!invoice) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: invoice });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/invoices/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch invoice", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/invoices/[id]
 * Update an existing invoice.
 *
 * Body: Partial invoice fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if invoice exists
        const existing = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        // Build update data - only include provided fields
        const updateData: Record<string, any> = {};

        if (body.invoiceNumber !== undefined) updateData.invoiceNumber = body.invoiceNumber;
        if (body.vendorName !== undefined) updateData.vendorName = body.vendorName;
        if (body.totalAmount !== undefined) updateData.totalAmount = parseFloat(body.totalAmount);
        if (body.currency !== undefined) updateData.currency = body.currency;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.sourceType !== undefined) updateData.sourceType = body.sourceType;
        if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        if (body.confidence !== undefined) updateData.confidence = parseFloat(body.confidence);
        if (body.paymentMethod !== undefined) updateData.paymentMethod = body.paymentMethod;
        if (body.paymentScheduledDate !== undefined) {
            updateData.paymentScheduledDate = body.paymentScheduledDate
                ? new Date(body.paymentScheduledDate)
                : null;
        }
        if (body.discountApplied !== undefined) {
            updateData.discountApplied = parseFloat(body.discountApplied);
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            data: invoice,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/invoices/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update invoice", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/invoices/[id]
 * Delete an invoice by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if invoice exists
        const existing = await prisma.invoice.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Invoice not found" },
                { status: 404 }
            );
        }

        // Prevent deletion of paid invoices
        if (existing.status === "paid" || existing.status === "scheduled_for_payment") {
            return NextResponse.json(
                { error: "Cannot delete invoice with status: " + existing.status },
                { status: 409 }
            );
        }

        await prisma.invoice.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Invoice " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/invoices/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete invoice", details: message },
            { status: 500 }
        );
    }
}
