import { NextRequest, NextResponse } from "next/server";
import { createOrchestrator } from "@/core/agents";
import { FinancialDocument } from "@/core/types";

// Singleton orchestrator instance
const orchestrator = createOrchestrator();

/**
 * GET /api/agents
 * Returns the status and health of all registered agents.
 */
export async function GET() {
    try {
        const agents = orchestrator.getRegisteredAgents();

        const healthSummary = {
            totalAgents: agents.length,
            idle: agents.filter((a) => a.status === "idle").length,
            processing: agents.filter((a) => a.status === "processing").length,
            error: agents.filter((a) => a.status === "error").length,
        };

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            health: healthSummary,
            agents: agents.map((agent) => ({
                id: agent.agentId,
                name: agent.agentName,
                capabilities: agent.capabilities,
                status: agent.status,
                lastProcessedAt: agent.lastProcessedAt,
                processedCount: agent.processedCount,
                averageLatencyMs: agent.averageLatencyMs,
            })),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { status: "error", message: message },
            { status: 500 }
        );
    }
}

/**
 * POST /api/agents
 * Trigger processing for a document through the full pipeline.
 * Body: { document: FinancialDocument }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const document: FinancialDocument = body.document;

        if (!document || !document.id) {
            return NextResponse.json(
                { error: "Missing required field: document with id" },
                { status: 400 }
            );
        }

        // Set defaults if not provided
        if (!document.status) {
            document.status = "ingested";
        }

        const result = await orchestrator.processDocument(document);

        return NextResponse.json({
            success: true,
            result: {
                documentId: result.documentId,
                traceId: result.traceId,
                status: result.status,
                decisionsCount: result.decisions.length,
                decisions: result.decisions.map((d) => ({
                    agentId: d.agentId,
                    action: d.action,
                    outcome: d.outcome,
                    confidenceScore: d.confidenceScore,
                    reasoning: d.reasoning,
                })),
                durationMs: result.durationMs,
                errors: result.errors,
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: "Processing failed", details: message },
            { status: 500 }
        );
    }
}
