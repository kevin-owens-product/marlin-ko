import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument, PolicyRule } from "@/core/types";

interface ApprovalEvaluation {
    autoApproved: boolean;
    approvalTier: "auto" | "manager" | "director" | "vp" | "cfo";
    matchedPolicies: PolicyMatch[];
    workflowId: string;
    reasoning: string;
}

interface PolicyMatch {
    ruleId: string;
    ruleName: string;
    result: "pass" | "fail" | "flag";
    details: string;
}

export class ApprovalAgent extends BaseAgent {
    private policies: PolicyRule[] = [
        {
            id: "pol-001",
            name: "Auto-Approve Low Value",
            description: "Auto-approve invoices under $1,000 from compliant vendors",
            condition: "amount < 1000 AND vendor.compliant AND risk.low",
            action: "approve",
            priority: 1,
            isActive: true,
        },
        {
            id: "pol-002",
            name: "Manager Approval Required",
            description: "Invoices $1,000-$10,000 require manager approval",
            condition: "amount >= 1000 AND amount < 10000",
            action: "require_step_up",
            priority: 2,
            isActive: true,
        },
        {
            id: "pol-003",
            name: "Director Approval Required",
            description: "Invoices $10,000-$50,000 require director approval",
            condition: "amount >= 10000 AND amount < 50000",
            action: "require_step_up",
            priority: 3,
            isActive: true,
        },
        {
            id: "pol-004",
            name: "VP Approval Required",
            description: "Invoices $50,000-$100,000 require VP approval",
            condition: "amount >= 50000 AND amount < 100000",
            action: "require_step_up",
            priority: 4,
            isActive: true,
        },
        {
            id: "pol-005",
            name: "CFO Approval Required",
            description: "Invoices over $100,000 require CFO approval",
            condition: "amount >= 100000",
            action: "require_step_up",
            priority: 5,
            isActive: true,
        },
        {
            id: "pol-006",
            name: "Block Non-Compliant Vendors",
            description: "Block invoices from non-compliant vendors",
            condition: "vendor.non_compliant",
            action: "reject",
            priority: 0,
            isActive: true,
        },
        {
            id: "pol-007",
            name: "Flag New Vendors",
            description: "Flag invoices from vendors with less than 3 months history",
            condition: "vendor.history < 90_days",
            action: "flag",
            priority: 1,
            isActive: true,
        },
    ];

    constructor() {
        super("agent-approval", "Approval Routing Agent", [
            "policy_evaluation",
            "auto_approve",
            "workflow_routing",
            "delegation_rules",
        ]);
    }

    async process(
        document: FinancialDocument,
        context: AgentContext
    ): Promise<AgentDecision> {
        // Simulate policy evaluation
        await new Promise((resolve) => setTimeout(resolve, 400));

        const evaluation = this.evaluatePolicies(document, context);

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action: evaluation.autoApproved
                ? "auto_approved"
                : "route_to_" + evaluation.approvalTier,
            reasoning: evaluation.reasoning,
            confidenceScore: evaluation.autoApproved ? 0.99 : 0.95,
            outcome: evaluation.autoApproved ? "executed" : "queued_for_review",
        };
    }

    private evaluatePolicies(
        document: FinancialDocument,
        context: AgentContext
    ): ApprovalEvaluation {
        const amount = document.extractedData?.header.totalAmount?.amount || 0;
        const matchedPolicies: PolicyMatch[] = [];

        // Check previous agent decisions from context for risk assessment
        const riskDecision = context.previousDecisions.find(
            (d) => d.agentId === "agent-risk"
        );
        const isHighRisk = riskDecision?.action === "risk_flagged"
            || riskDecision?.outcome === "blocked";

        // Check compliance decision
        const complianceDecision = context.previousDecisions.find(
            (d) => d.agentId === "agent-compliance"
        );
        const isNonCompliant = complianceDecision?.outcome === "blocked";

        // Evaluate each active policy
        const activePolicies = this.policies
            .filter((p) => p.isActive)
            .sort((a, b) => a.priority - b.priority);

        let blocked = false;
        let flagged = false;

        for (const policy of activePolicies) {
            const result = this.evaluatePolicy(policy, amount, isHighRisk, isNonCompliant);
            matchedPolicies.push(result);

            if (result.result === "fail") blocked = true;
            if (result.result === "flag") flagged = true;
        }

        // Determine approval tier
        let approvalTier: ApprovalEvaluation["approvalTier"] = "auto";
        if (blocked) {
            approvalTier = "cfo";
        } else if (amount >= 100000) {
            approvalTier = "cfo";
        } else if (amount >= 50000) {
            approvalTier = "vp";
        } else if (amount >= 10000) {
            approvalTier = "director";
        } else if (amount >= 1000 || flagged || isHighRisk) {
            approvalTier = "manager";
        }

        const autoApproved = approvalTier === "auto" && !blocked && !flagged && !isHighRisk;
        const workflowId = "WF-" + Date.now().toString(36).toUpperCase();

        const reasoning = this.buildReasoning(
            amount, autoApproved, approvalTier, matchedPolicies, isHighRisk, workflowId
        );

        return { autoApproved, approvalTier, matchedPolicies, workflowId, reasoning };
    }

    private evaluatePolicy(
        policy: PolicyRule,
        amount: number,
        isHighRisk: boolean,
        isNonCompliant: boolean
    ): PolicyMatch {
        switch (policy.id) {
            case "pol-001":
                return {
                    ruleId: policy.id,
                    ruleName: policy.name,
                    result: amount < 1000 && !isNonCompliant && !isHighRisk ? "pass" : "flag",
                    details: amount < 1000
                        ? "Amount $" + amount.toFixed(2) + " qualifies for auto-approval."
                        : "Amount $" + amount.toFixed(2) + " exceeds auto-approval threshold.",
                };
            case "pol-006":
                return {
                    ruleId: policy.id,
                    ruleName: policy.name,
                    result: isNonCompliant ? "fail" : "pass",
                    details: isNonCompliant
                        ? "Vendor failed compliance check. Invoice blocked."
                        : "Vendor compliance status verified.",
                };
            case "pol-007": {
                const isNewVendor = Math.random() > 0.7;
                return {
                    ruleId: policy.id,
                    ruleName: policy.name,
                    result: isNewVendor ? "flag" : "pass",
                    details: isNewVendor
                        ? "New vendor (< 90 days). Additional review recommended."
                        : "Established vendor relationship.",
                };
            }
            default:
                return {
                    ruleId: policy.id,
                    ruleName: policy.name,
                    result: "pass",
                    details: "Policy " + policy.name + " evaluated.",
                };
        }
    }

    private buildReasoning(
        amount: number,
        autoApproved: boolean,
        tier: string,
        policies: PolicyMatch[],
        isHighRisk: boolean,
        workflowId: string
    ): string {
        const parts: string[] = [];

        parts.push("Evaluated " + policies.length + " active policies against invoice amount $" + amount.toFixed(2) + ".");

        const failedPolicies = policies.filter((p) => p.result === "fail");
        const flaggedPolicies = policies.filter((p) => p.result === "flag");

        if (failedPolicies.length > 0) {
            parts.push("BLOCKED by: " + failedPolicies.map((p) => p.ruleName).join(", ") + ".");
        }

        if (flaggedPolicies.length > 0) {
            parts.push("Flagged by: " + flaggedPolicies.map((p) => p.ruleName).join(", ") + ".");
        }

        if (isHighRisk) {
            parts.push("Elevated risk assessment requires additional approval.");
        }

        if (autoApproved) {
            parts.push("All policies passed. Invoice auto-approved per delegation matrix.");
        } else {
            parts.push("Routed to " + tier + " approval workflow (" + workflowId + ").");
        }

        return parts.join(" ");
    }
}
