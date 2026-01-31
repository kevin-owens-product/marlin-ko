import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/expense-policies/[id]
 * Retrieve a single expense policy by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const policy = await prisma.expensePolicy.findUnique({
            where: { id },
        });

        if (!policy) {
            return NextResponse.json(
                { error: "Expense policy not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: policy });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/expense-policies/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch expense policy", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/expense-policies/[id]
 * Update an existing expense policy.
 *
 * Body: Partial expense policy fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if expense policy exists
        const existing = await prisma.expensePolicy.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Expense policy not found" },
                { status: 404 }
            );
        }

        const policy = await prisma.expensePolicy.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: policy,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/expense-policies/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update expense policy", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/expense-policies/[id]
 * Delete an expense policy by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if expense policy exists
        const existing = await prisma.expensePolicy.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Expense policy not found" },
                { status: 404 }
            );
        }

        await prisma.expensePolicy.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Expense policy " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/expense-policies/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete expense policy", details: message },
            { status: 500 }
        );
    }
}
