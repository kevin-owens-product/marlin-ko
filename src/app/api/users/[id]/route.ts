import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id]
 * Retrieve a single user by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: user });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/users/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to fetch user", details: message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/users/[id]
 * Update an existing user.
 *
 * Body: Partial user fields to update.
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const user = await prisma.user.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({
            success: true,
            data: user,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] PUT /api/users/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to update user", details: message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/users/[id]
 * Delete a user by ID.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { id },
        });

        if (!existing) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "User " + id + " deleted successfully",
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] DELETE /api/users/[id] error:", message);
        return NextResponse.json(
            { error: "Failed to delete user", details: message },
            { status: 500 }
        );
    }
}
