import { NextRequest, NextResponse } from "next/server";
import { createOrchestrator } from "@/core/agents";
import { FinancialDocument } from "@/core/types";

const orchestrator = createOrchestrator();

/**
 * POST /api/agents/process
 * Process a document through the orchestrator pipeline.
 * Accepts either a full FinancialDocument or minimal fields to create one.
 *
 * Body options:
 * 1. Full document: { document: FinancialDocument }
 * 2. Minimal: { invoiceNumber, vendorName, amount, currency?, sourceType? }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        let document: FinancialDocument;

        if (body.document) {
            // Full document provided
            document = body.document;
        } else {
            // Build document from minimal fields
            const invoiceNumber = body.invoiceNumber || "INV-" + Math.floor(Math.random() * 100000);
            const vendorName = body.vendorName || "Unknown Vendor";
            const amount = body.amount || 0;
            const currency = body.currency || "USD";
            const sourceType = body.sourceType || "api";

            document = {
                id: crypto.randomUUID(),
                tenantId: body.tenantId || "tenant-default",
                sourceType: sourceType,
                rawFileRef: body.rawFileRef || "api-submission/" + invoiceNumber,
                status: "ingested",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                metadata: {
                    senderEmail: body.senderEmail,
                    originalFileName: body.fileName,
                    submittedVia: "api",
                },
                extractedData: {
                    header: {
                        invoiceNumber: invoiceNumber,
                        invoiceDate: body.invoiceDate || new Date().toISOString().split("T")[0],
                        dueDate: body.dueDate,
                        vendorName: vendorName,
                        vendorId: body.vendorId,
                        totalAmount: { amount: amount, currency: currency },
                        taxAmount: body.taxAmount
                            ? { amount: body.taxAmount, currency: currency }
                            : undefined,
                    },
                    lineItems: body.lineItems || [
                        {
                            description: "Line item from API submission",
                            quantity: 1,
                            unitPrice: amount,
                            totalAmount: amount,
                        },
                    ],
                },
            };
        }

        // Validate
        if (!document.id) {
            document.id = crypto.randomUUID();
        }

        console.log(
            "[API] Processing document " + document.id +
            " (" + (document.extractedData?.header.vendorName || "unknown vendor") + ")"
        );

        const result = await orchestrator.processDocument(document);

        return NextResponse.json({
            success: true,
            document: {
                id: document.id,
                invoiceNumber: document.extractedData?.header.invoiceNumber,
                vendorName: document.extractedData?.header.vendorName,
                amount: document.extractedData?.header.totalAmount,
            },
            pipeline: {
                traceId: result.traceId,
                status: result.status,
                durationMs: result.durationMs,
                stagesCompleted: result.decisions.length,
            },
            decisions: result.decisions.map((d) => ({
                agent: d.agentId,
                action: d.action,
                outcome: d.outcome,
                confidence: d.confidenceScore,
                reasoning: d.reasoning,
                timestamp: d.timestamp,
            })),
            errors: result.errors.length > 0 ? result.errors : undefined,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] Process error:", message);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process document",
                details: message,
            },
            { status: 500 }
        );
    }
}
