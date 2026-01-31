import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument } from "@/core/types";
import { prisma } from "@/lib/db";

export class CaptureAgent extends BaseAgent {
    constructor() {
        super("agent-capture", "Capture Agent", ["ocr", "extraction", "validation"]);
    }

    async process(document: FinancialDocument, context: AgentContext): Promise<AgentDecision> {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800));

        // logical mock decision
        const confidence = Math.random() > 0.1 ? 0.98 : 0.75; // Mostly high confidence

        // Persist to DB
        try {
            await prisma.invoice.create({
                data: {
                    sourceType: document.sourceType,
                    status: "extracted",
                    rawFileRef: document.rawFileRef,
                    invoiceNumber: "INV-" + Math.floor(Math.random() * 10000), // Mock extracted
                    vendorName: Math.random() > 0.5 ? "Acme Corp" : "Global Logistics",
                    totalAmount: Math.random() * 5000,
                    confidence: confidence
                } as any // Simplified for mock
            });
        } catch (e) {
            console.error("Failed to save to DB", e);
        }

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action: "extract_data",
            reasoning: "Extracted header fields and line items using OCR model v2.1. Detected standard invoice format.",
            confidenceScore: confidence,
            outcome: confidence > 0.9 ? "executed" : "queued_for_review"
        };
    }
}
