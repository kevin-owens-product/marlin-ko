import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/reports/[id]
 * Retrieve a single report by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const report = await prisma.report.findUnique({
            where: { id },
        });

        if (!report) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: report });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/reports/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch report", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/reports/[id]
 * Update an existing report.
 *
 * Body: Partial report fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if report exists
        const existing = await prisma.report.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        const report = await prisma.report.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: report,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/reports/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update report", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/reports/[id]
 * Delete a report by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if report exists
        const existing = await prisma.report.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        await prisma.report.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Report " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/reports/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete report", details: message },
            { status: 500 }
        );
    }
}
