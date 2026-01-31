// Base
export { BaseAgent } from "./base";
export type { AgentContext } from "./base";

// Orchestrator
export { Orchestrator } from "./orchestrator";
export type { PipelineStage, ProcessingResult, PipelineError, AgentStatus } from "./orchestrator";

// Agents
export { CaptureAgent } from "./capture-agent";
export { ClassificationAgent } from "./classification-agent";
export { ComplianceAgent } from "./compliance-agent";
export { MatchingAgent } from "./matching-agent";
export { RiskAgent } from "./risk-agent";
export { ApprovalAgent } from "./approval-agent";
export { PaymentAgent } from "./payment-agent";
export { CommunicationAgent } from "./communication-agent";
export { AdvisoryAgent } from "./advisory-agent";

// Factory: creates a fully-wired orchestrator with all agents registered
export function createOrchestrator(): Orchestrator {
    const orchestrator = new Orchestrator();

    orchestrator.registerAgent(new CaptureAgent());
    orchestrator.registerAgent(new ClassificationAgent());
    orchestrator.registerAgent(new ComplianceAgent());
    orchestrator.registerAgent(new MatchingAgent());
    orchestrator.registerAgent(new RiskAgent());
    orchestrator.registerAgent(new ApprovalAgent());
    orchestrator.registerAgent(new PaymentAgent());
    orchestrator.registerAgent(new CommunicationAgent());
    orchestrator.registerAgent(new AdvisoryAgent());

    return orchestrator;
}

// Re-import to use in factory
import { Orchestrator } from "./orchestrator";
import { CaptureAgent } from "./capture-agent";
import { ClassificationAgent } from "./classification-agent";
import { ComplianceAgent } from "./compliance-agent";
import { MatchingAgent } from "./matching-agent";
import { RiskAgent } from "./risk-agent";
import { ApprovalAgent } from "./approval-agent";
import { PaymentAgent } from "./payment-agent";
import { CommunicationAgent } from "./communication-agent";
import { AdvisoryAgent } from "./advisory-agent";
