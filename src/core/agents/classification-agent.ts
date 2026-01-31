import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument } from "@/core/types";

export class ClassificationAgent extends BaseAgent {
    constructor() {
        super("agent-classification", "Classification Agent", ["gl_coding", "cost_center", "tax_determination"]);
    }

    async process(document: FinancialDocument, context: AgentContext): Promise<AgentDecision> {
        await new Promise(resolve => setTimeout(resolve, 600));

        const confidence = Math.random() > 0.2 ? 0.95 : 0.65;

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action: "assign_gl_code",
            reasoning: "Matched vendor 'Acme Corp' to historical pattern. Assigned GL Code 6001 (Software Subscription).",
            confidenceScore: confidence,
            outcome: confidence > 0.9 ? "executed" : "queued_for_review"
        };
    }
}
