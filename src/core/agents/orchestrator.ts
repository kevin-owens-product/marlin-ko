import { BaseAgent, AgentContext } from "./base";
import { FinancialDocument, AgentDecision } from "@/core/types";

export interface PipelineStage {
    agentId: string;
    required: boolean;
    parallel?: string[]; // Agent IDs that can run in parallel with this one
}

export interface ProcessingResult {
    documentId: string;
    traceId: string;
    status: "completed" | "failed" | "blocked" | "review_required";
    decisions: AgentDecision[];
    startedAt: string;
    completedAt: string;
    durationMs: number;
    errors: PipelineError[];
}

export interface PipelineError {
    agentId: string;
    error: string;
    timestamp: string;
    recoverable: boolean;
}

export interface AgentStatus {
    agentId: string;
    agentName: string;
    capabilities: string[];
    status: "idle" | "processing" | "error";
    lastProcessedAt: string | null;
    processedCount: number;
    averageLatencyMs: number;
}

export class Orchestrator {
    private agents: Map<string, BaseAgent> = new Map();
    private agentStats: Map<string, AgentStatus> = new Map();

    // Define the standard invoice processing pipeline
    private readonly pipeline: PipelineStage[] = [
        { agentId: "agent-capture", required: true },
        { agentId: "agent-compliance", required: true },
        { agentId: "agent-classification", required: true },
        { agentId: "agent-matching", required: true },
        { agentId: "agent-risk", required: true, parallel: ["agent-matching"] },
        { agentId: "agent-approval", required: true },
        { agentId: "agent-payment", required: true },
        { agentId: "agent-communication", required: false },
        { agentId: "agent-advisory", required: false },
    ];

    constructor() {}

    registerAgent(agent: BaseAgent) {
        this.agents.set(agent.id, agent);
        this.agentStats.set(agent.id, {
            agentId: agent.id,
            agentName: agent.name,
            capabilities: agent.capabilities,
            status: "idle",
            lastProcessedAt: null,
            processedCount: 0,
            averageLatencyMs: 0,
        });
    }

    getAgent(id: string): BaseAgent | undefined {
        return this.agents.get(id);
    }

    getRegisteredAgents(): AgentStatus[] {
        return Array.from(this.agentStats.values());
    }

    getAgentStatus(id: string): AgentStatus | undefined {
        return this.agentStats.get(id);
    }

    /**
     * Process a document through the full agent pipeline.
     * Handles sequential and parallel execution, error recovery, and status tracking.
     */
    async processDocument(document: FinancialDocument): Promise<ProcessingResult> {
        const traceId = crypto.randomUUID();
        const startedAt = new Date().toISOString();
        const startTime = Date.now();
        const decisions: AgentDecision[] = [];
        const errors: PipelineError[] = [];

        const context: AgentContext = {
            traceId,
            previousDecisions: [],
        };

        console.log("[Orchestrator] Starting pipeline for document " + document.id + " (trace: " + traceId + ")");

        // Track which agents have been processed (for parallel deduplication)
        const processedAgents = new Set<string>();

        for (const stage of this.pipeline) {
            // Skip if already processed (e.g., ran in parallel with a previous stage)
            if (processedAgents.has(stage.agentId)) {
                continue;
            }

            // Check if previous required stage blocked processing
            const lastDecision = decisions.length > 0 ? decisions[decisions.length - 1] : null;
            if (lastDecision?.outcome === "blocked") {
                const blockingStage = this.pipeline.find(
                    (s) => s.agentId === lastDecision.agentId
                );
                if (blockingStage?.required) {
                    console.log(
                        "[Orchestrator] Pipeline blocked by " + lastDecision.agentId +
                        ". Skipping to communication agent."
                    );
                    // Skip to communication agent for notification
                    const commResult = await this.executeAgent(
                        "agent-communication",
                        document,
                        context,
                        errors
                    );
                    if (commResult) {
                        decisions.push(commResult);
                        context.previousDecisions.push(commResult);
                    }
                    break;
                }
            }

            // Check for parallel execution opportunities
            if (stage.parallel && stage.parallel.length > 0) {
                const parallelIds = [stage.agentId, ...stage.parallel].filter(
                    (id) => !processedAgents.has(id) && this.agents.has(id)
                );

                if (parallelIds.length > 1) {
                    console.log(
                        "[Orchestrator] Parallel execution: " + parallelIds.join(", ")
                    );
                    const parallelResults = await this.executeParallel(
                        parallelIds,
                        document,
                        context,
                        errors
                    );

                    for (const result of parallelResults) {
                        if (result) {
                            decisions.push(result);
                            context.previousDecisions.push(result);
                            processedAgents.add(result.agentId);
                        }
                    }
                    continue;
                }
            }

            // Sequential execution
            const decision = await this.executeAgent(
                stage.agentId,
                document,
                context,
                errors
            );

            if (decision) {
                decisions.push(decision);
                context.previousDecisions.push(decision);
                processedAgents.add(stage.agentId);
            } else if (stage.required) {
                console.log(
                    "[Orchestrator] Required agent " + stage.agentId + " failed. Halting pipeline."
                );
                break;
            }
        }

        const completedAt = new Date().toISOString();
        const durationMs = Date.now() - startTime;

        // Determine overall status
        let status: ProcessingResult["status"] = "completed";
        if (errors.length > 0 && errors.some((e) => !e.recoverable)) {
            status = "failed";
        } else if (decisions.some((d) => d.outcome === "blocked")) {
            status = "blocked";
        } else if (decisions.some((d) => d.outcome === "queued_for_review")) {
            status = "review_required";
        }

        console.log(
            "[Orchestrator] Pipeline " + status + " for document " + document.id +
            " (" + durationMs + "ms, " + decisions.length + " decisions)"
        );

        return {
            documentId: document.id,
            traceId,
            status,
            decisions,
            startedAt,
            completedAt,
            durationMs,
            errors,
        };
    }

    /**
     * Execute a single agent with error handling and metrics tracking.
     */
    private async executeAgent(
        agentId: string,
        document: FinancialDocument,
        context: AgentContext,
        errors: PipelineError[]
    ): Promise<AgentDecision | null> {
        const agent = this.agents.get(agentId);
        if (!agent) {
            console.warn("[Orchestrator] Agent not registered: " + agentId);
            return null;
        }

        const stats = this.agentStats.get(agentId);
        if (stats) {
            stats.status = "processing";
        }

        const agentStart = Date.now();

        try {
            console.log("[Orchestrator] Executing " + agent.name + " (" + agentId + ")");
            const decision = await agent.process(document, context);
            const latency = Date.now() - agentStart;

            // Update stats
            if (stats) {
                stats.status = "idle";
                stats.lastProcessedAt = new Date().toISOString();
                stats.processedCount += 1;
                stats.averageLatencyMs = Math.round(
                    (stats.averageLatencyMs * (stats.processedCount - 1) + latency) /
                    stats.processedCount
                );
            }

            console.log(
                "[Orchestrator] " + agent.name + " completed: " +
                decision.action + " (" + decision.outcome + ", " + latency + "ms)"
            );

            return decision;
        } catch (err) {
            const latency = Date.now() - agentStart;
            const errorMessage = err instanceof Error ? err.message : "Unknown error";

            console.error("[Orchestrator] " + agent.name + " failed: " + errorMessage);

            if (stats) {
                stats.status = "error";
            }

            errors.push({
                agentId,
                error: errorMessage,
                timestamp: new Date().toISOString(),
                recoverable: false,
            });

            return null;
        }
    }

    /**
     * Execute multiple agents in parallel.
     */
    private async executeParallel(
        agentIds: string[],
        document: FinancialDocument,
        context: AgentContext,
        errors: PipelineError[]
    ): Promise<(AgentDecision | null)[]> {
        const promises = agentIds.map((id) =>
            this.executeAgent(id, document, context, errors)
        );
        return Promise.all(promises);
    }

    /**
     * Routes the document to the next appropriate agent based on its status.
     * Legacy method for backward compatibility.
     */
    async route(document: FinancialDocument): Promise<AgentDecision | null> {
        let targetAgentId: string | null = null;

        switch (document.status) {
            case "ingested":
                targetAgentId = "agent-capture";
                break;
            case "extracted":
                targetAgentId = "agent-compliance";
                break;
            case "compliance_checked":
                targetAgentId = "agent-classification";
                break;
            case "classified":
                targetAgentId = "agent-matching";
                break;
            case "matched":
                targetAgentId = "agent-approval";
                break;
            case "approved":
                targetAgentId = "agent-payment";
                break;
            default:
                console.log("[Orchestrator] No agent found for status: " + document.status);
                return null;
        }

        if (targetAgentId && this.agents.has(targetAgentId)) {
            const agent = this.agents.get(targetAgentId)!;
            const context: AgentContext = {
                traceId: crypto.randomUUID(),
                previousDecisions: [],
            };

            console.log("[Orchestrator] Routing document " + document.id + " to agent " + agent.name);
            return await agent.process(document, context);
        }

        return null;
    }
}
