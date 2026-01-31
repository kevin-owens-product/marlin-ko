import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/approval-workflows/[id]
 * Retrieve a single approval workflow by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const workflow = await prisma.approvalWorkflow.findUnique({
            where: { id },
        });

        if (!workflow) {
            return NextResponse.json(
                { error: "Approval workflow not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: workflow });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/approval-workflows/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch approval workflow", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/approval-workflows/[id]
 * Update an existing approval workflow.
 *
 * Body: Partial approval workflow fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if approval workflow exists
        const existing = await prisma.approvalWorkflow.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Approval workflow not found" },
                { status: 404 }
            );
        }

        const workflow = await prisma.approvalWorkflow.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: workflow,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/approval-workflows/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update approval workflow", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/approval-workflows/[id]
 * Delete an approval workflow by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if approval workflow exists
        const existing = await prisma.approvalWorkflow.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Approval workflow not found" },
                { status: 404 }
            );
        }

        await prisma.approvalWorkflow.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Approval workflow " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/approval-workflows/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete approval workflow", details: message },
            { status: 500 }
        );
    }
}
