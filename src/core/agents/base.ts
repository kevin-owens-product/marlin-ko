import { AgentDecision, FinancialDocument } from "@/core/types";

export interface AgentContext {
    traceId: string;
    previousDecisions: AgentDecision[];
}

export abstract class BaseAgent {
    public id: string;
    public name: string;
    public capabilities: string[];

    constructor(id: string, name: string, capabilities: string[] = []) {
        this.id = id;
        this.name = name;
        this.capabilities = capabilities;
    }

    /**
     * The core method every agent must implement.
     * Analyzes the document and returns a decision.
     */
    abstract process(
        document: FinancialDocument,
        context: AgentContext
    ): Promise<AgentDecision>;

    protected createMetadata(action: string, reasoning: string, confidence: number, outcome: AgentDecision['outcome']): AgentDecision {
        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: 'unknown', // Should be injected or passed
            timestamp: new Date().toISOString(),
            action,
            reasoning,
            confidenceScore: confidence,
            outcome
        };
    }
}
