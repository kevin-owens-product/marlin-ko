import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument } from "@/core/types";

export class ComplianceAgent extends BaseAgent {
    constructor() {
        super("agent-compliance", "Compliance Agent", ["schema_validation", "regulatory_check"]);
    }

    async process(document: FinancialDocument, context: AgentContext): Promise<AgentDecision> {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // MOCK LOGIC: Check for specific "triggers" in the document metadata or raw content
        // In a real app, this would use an XML validator against .xsd schemas

        let isCompliant = true;
        let reasoning = "Document passed all UBL 2.1 schema validations.";

        // Trigger failure if rawFileRef contains "invalid"
        if (document.rawFileRef?.includes("invalid") || document.metadata?.forceFailure) {
            isCompliant = false;
            reasoning = "Schema Error: Missing required element 'cbc:IssueDate' in Invoice Header. [UBL-CR-001]";
        }

        // Check specific country rules (Mock)
        if (isCompliant && document.metadata?.country === "FR") {
            // France require Factur-X specific checks
            if (!document.metadata?.hasPdfEmbedding) {
                isCompliant = false;
                reasoning = "Compliance Failure: French PPF requires Factur-X (PDF/A-3) format.";
            }
        }

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action: isCompliant ? "certify_compliance" : "flag_non_compliance",
            reasoning: reasoning,
            confidenceScore: 1.0, // Rules are deterministic
            outcome: isCompliant ? "executed" : "blocked"
        };
    }
}
