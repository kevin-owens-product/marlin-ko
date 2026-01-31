import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/dashboard
 * Returns aggregated dashboard metrics for the finance platform.
 */
export async function GET() {
    try {
        // Execute all aggregation queries in parallel
        const [
            totalInvoices,
            statusCounts,
            totalAmountResult,
            recentInvoices,
            avgConfidence,
            paymentMethodCounts,
            discountSavings,
        ] = await Promise.all([
            // Total invoice count
            prisma.invoice.count(),

            // Count by status
            prisma.invoice.groupBy({
                by: ["status"],
                _count: { id: true },
            }),

            // Total amount across all invoices
            prisma.invoice.aggregate({
                _sum: { totalAmount: true },
                _avg: { totalAmount: true },
                _max: { totalAmount: true },
                _min: { totalAmount: true },
            }),

            // Recent invoices (last 10)
            prisma.invoice.findMany({
                orderBy: { createdAt: "desc" },
                take: 10,
                select: {
                    id: true,
                    invoiceNumber: true,
                    vendorName: true,
                    totalAmount: true,
                    status: true,
                    createdAt: true,
                    aiConfidence: true,
                },
            }),

            // Average confidence score
            prisma.invoice.aggregate({
                _avg: { aiConfidence: true },
            }),

            // Payment method distribution
            prisma.invoice.groupBy({
                by: ["paymentMethod"],
                _count: { id: true },
                where: {
                    paymentMethod: { not: null },
                },
            }),

            // Total discount savings
            prisma.invoice.aggregate({
                _sum: { discountApplied: true },
                where: {
                    discountApplied: { gt: 0 },
                },
            }),
        ]);

        // Transform status counts into a map
        const statusMap: Record<string, number> = {};
        for (const item of statusCounts) {
            statusMap[item.status] = item._count.id;
        }

        // Transform payment method counts
        const paymentMethods: Record<string, number> = {};
        for (const item of paymentMethodCounts) {
            if (item.paymentMethod) {
                paymentMethods[item.paymentMethod] = item._count.id;
            }
        }

        // Calculate processing metrics
        const processedCount =
            (statusMap["approved"] || 0) +
            (statusMap["paid"] || 0) +
            (statusMap["scheduled_for_payment"] || 0);

        const pendingCount =
            (statusMap["ingested"] || 0) +
            (statusMap["extracted"] || 0) +
            (statusMap["classified"] || 0) +
            (statusMap["compliance_checked"] || 0) +
            (statusMap["matched"] || 0);

        const reviewCount = statusMap["flagged_for_review"] || 0;
        const rejectedCount = statusMap["rejected"] || 0;

        const automationRate = totalInvoices > 0
            ? Math.round((processedCount / totalInvoices) * 100)
            : 0;

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            overview: {
                totalInvoices,
                totalAmount: totalAmountResult._sum.totalAmount || 0,
                averageAmount: Math.round((totalAmountResult._avg.totalAmount || 0) * 100) / 100,
                maxAmount: totalAmountResult._max.totalAmount || 0,
                minAmount: totalAmountResult._min.totalAmount || 0,
            },
            processing: {
                processed: processedCount,
                pending: pendingCount,
                flaggedForReview: reviewCount,
                rejected: rejectedCount,
                automationRate: automationRate,
            },
            statusBreakdown: statusMap,
            financials: {
                totalDiscountSavings: discountSavings._sum.discountApplied || 0,
                averageConfidence: Math.round((avgConfidence._avg.aiConfidence || 0) * 100) / 100,
                paymentMethodDistribution: paymentMethods,
            },
            recentActivity: recentInvoices.map((inv) => ({
                id: inv.id,
                invoiceNumber: inv.invoiceNumber,
                vendorName: inv.vendorName,
                amount: inv.totalAmount,
                status: inv.status,
                confidence: inv.aiConfidence,
                createdAt: inv.createdAt,
            })),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] GET /api/dashboard error:", message);
        return NextResponse.json(
            { error: "Failed to fetch dashboard metrics", details: message },
            { status: 500 }
        );
    }
}
