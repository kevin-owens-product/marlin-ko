import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/expenses/[id]
 * Retrieve a single expense by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const expense = await prisma.expense.findUnique({
            where: { id },
        });

        if (!expense) {
            return NextResponse.json(
                { error: "Expense not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: expense });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/expenses/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch expense", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/expenses/[id]
 * Update an existing expense.
 *
 * Body: Partial expense fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if expense exists
        const existing = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Expense not found" },
                { status: 404 }
            );
        }

        // Parse numeric and date fields if provided
        if (body.amount !== undefined) {
            body.amount = parseFloat(body.amount);
        }
        if (body.expenseDate !== undefined) {
            body.expenseDate = new Date(body.expenseDate);
        }

        const expense = await prisma.expense.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: expense,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/expenses/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update expense", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/expenses/[id]
 * Delete an expense by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if expense exists
        const existing = await prisma.expense.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Expense not found" },
                { status: 404 }
            );
        }

        // Prevent deletion of approved or reimbursed expenses
        if (existing.status === "approved" || existing.status === "reimbursed") {
            return NextResponse.json(
                { error: "Cannot delete expense with status: " + existing.status },
                { status: 409 }
            );
        }

        await prisma.expense.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Expense " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/expenses/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete expense", details: message },
            { status: 500 }
        );
    }
}
