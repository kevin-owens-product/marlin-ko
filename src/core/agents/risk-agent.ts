import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument } from "@/core/types";

interface RiskSignal {
    category: "duplicate" | "anomaly" | "suspicious_pattern" | "velocity" | "vendor_risk";
    severity: "low" | "medium" | "high" | "critical";
    score: number;
    description: string;
}

interface RiskAssessment {
    compositeScore: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    signals: RiskSignal[];
    recommendation: "approve" | "review" | "escalate" | "block";
}

export class RiskAgent extends BaseAgent {
    constructor() {
        super("agent-risk", "Risk Assessment Agent", [
            "duplicate_detection",
            "anomaly_detection",
            "suspicious_patterns",
            "vendor_risk_scoring",
            "velocity_checks",
        ]);
    }

    async process(
        document: FinancialDocument,
        context: AgentContext
    ): Promise<AgentDecision> {
        // Simulate risk analysis processing
        await new Promise((resolve) => setTimeout(resolve, 600));

        const assessment = this.assessRisk(document, context);

        const action = assessment.riskLevel === "low" || assessment.riskLevel === "medium"
            ? "risk_cleared"
            : "risk_flagged";

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action,
            reasoning: this.buildReasoning(assessment),
            confidenceScore: this.riskToConfidence(assessment.compositeScore),
            outcome: this.determineOutcome(assessment),
        };
    }

    private assessRisk(
        document: FinancialDocument,
        context: AgentContext
    ): RiskAssessment {
        const signals: RiskSignal[] = [];

        signals.push(this.checkDuplicate(document));
        signals.push(this.checkAmountAnomaly(document));
        signals.push(this.checkSuspiciousPatterns(document));
        signals.push(this.checkVelocity(document));
        signals.push(this.checkVendorRisk(document));

        // Calculate composite score (weighted average with max-cap)
        const activeSignals = signals.filter((s) => s.score > 0);
        let compositeScore = 0;

        if (activeSignals.length > 0) {
            const weights: Record<string, number> = {
                critical: 3.0,
                high: 2.0,
                medium: 1.0,
                low: 0.5,
            };

            let weightedSum = 0;
            let totalWeight = 0;
            for (const signal of activeSignals) {
                const w = weights[signal.severity] || 1;
                weightedSum += signal.score * w;
                totalWeight += w;
            }
            compositeScore = Math.min(100, Math.round(weightedSum / totalWeight));
        }

        const riskLevel = this.scoreToLevel(compositeScore);
        const recommendation = this.determineRecommendation(riskLevel);

        return { compositeScore, riskLevel, signals, recommendation };
    }

    private checkDuplicate(document: FinancialDocument): RiskSignal {
        const isDuplicate = Math.random() > 0.92;

        if (isDuplicate) {
            const invoiceNum = document.extractedData?.header.invoiceNumber || "unknown";
            const vendor = document.extractedData?.header.vendorName || "unknown vendor";
            return {
                category: "duplicate",
                severity: "critical",
                score: 95,
                description: "Potential duplicate detected. Invoice number " + invoiceNum +
                    " from " + vendor + " matches existing record within 90-day window.",
            };
        }

        return {
            category: "duplicate",
            severity: "low",
            score: 0,
            description: "No duplicate invoices detected.",
        };
    }

    private checkAmountAnomaly(document: FinancialDocument): RiskSignal {
        const amount = document.extractedData?.header.totalAmount?.amount || 0;

        if (amount > 50000) {
            return {
                category: "anomaly",
                severity: "high",
                score: 70,
                description: "Invoice amount $" + amount.toFixed(2) +
                    " exceeds vendor historical average by more than 3 standard deviations.",
            };
        }

        if (amount > 10000) {
            return {
                category: "anomaly",
                severity: "medium",
                score: 30,
                description: "Invoice amount $" + amount.toFixed(2) +
                    " is above average for this vendor but within acceptable range.",
            };
        }

        return {
            category: "anomaly",
            severity: "low",
            score: 5,
            description: "Invoice amount $" + amount.toFixed(2) +
                " is within normal range for this vendor.",
        };
    }

    private checkSuspiciousPatterns(document: FinancialDocument): RiskSignal {
        const amount = document.extractedData?.header.totalAmount?.amount || 0;
        const isRoundNumber = amount > 0 && amount % 1000 === 0;
        const suspiciousScore = Math.random() > 0.85 ? 60 : 0;

        if (isRoundNumber && amount > 5000) {
            return {
                category: "suspicious_pattern",
                severity: "medium",
                score: 40,
                description: "Round dollar amount ($" + amount.toFixed(2) +
                    ") on high-value invoice. Pattern flagged for verification.",
            };
        }

        if (suspiciousScore > 0) {
            return {
                category: "suspicious_pattern",
                severity: "medium",
                score: suspiciousScore,
                description: "Invoice metadata matches known suspicious pattern: vendor address change within 30 days of submission.",
            };
        }

        return {
            category: "suspicious_pattern",
            severity: "low",
            score: 0,
            description: "No suspicious patterns detected.",
        };
    }

    private checkVelocity(document: FinancialDocument): RiskSignal {
        const highVelocity = Math.random() > 0.9;
        const vendor = document.extractedData?.header.vendorName || "unknown";

        if (highVelocity) {
            return {
                category: "velocity",
                severity: "medium",
                score: 45,
                description: "Vendor " + vendor +
                    " has submitted 12 invoices in the last 7 days, exceeding the 5-per-week threshold.",
            };
        }

        return {
            category: "velocity",
            severity: "low",
            score: 0,
            description: "Invoice submission velocity within normal range.",
        };
    }

    private checkVendorRisk(document: FinancialDocument): RiskSignal {
        const vendorRiskScore = Math.floor(Math.random() * 100);
        const vendor = document.extractedData?.header.vendorName || "unknown";

        if (vendorRiskScore > 75) {
            return {
                category: "vendor_risk",
                severity: "high",
                score: vendorRiskScore,
                description: "Vendor " + vendor +
                    " has elevated risk profile (score: " + vendorRiskScore +
                    "/100). Recent compliance issues flagged.",
            };
        }

        if (vendorRiskScore > 40) {
            return {
                category: "vendor_risk",
                severity: "medium",
                score: Math.round(vendorRiskScore * 0.5),
                description: "Vendor risk profile moderate (score: " + vendorRiskScore + "/100).",
            };
        }

        return {
            category: "vendor_risk",
            severity: "low",
            score: 5,
            description: "Vendor risk profile low (score: " + vendorRiskScore + "/100). No concerns.",
        };
    }

    private scoreToLevel(score: number): "low" | "medium" | "high" | "critical" {
        if (score >= 80) return "critical";
        if (score >= 50) return "high";
        if (score >= 25) return "medium";
        return "low";
    }

    private determineRecommendation(
        level: "low" | "medium" | "high" | "critical"
    ): "approve" | "review" | "escalate" | "block" {
        switch (level) {
            case "low": return "approve";
            case "medium": return "review";
            case "high": return "escalate";
            case "critical": return "block";
        }
    }

    private riskToConfidence(riskScore: number): number {
        return Math.round((1 - riskScore / 100) * 100) / 100;
    }

    private determineOutcome(assessment: RiskAssessment): AgentDecision["outcome"] {
        switch (assessment.recommendation) {
            case "approve": return "executed";
            case "review": return "queued_for_review";
            case "escalate": return "queued_for_review";
            case "block": return "blocked";
        }
    }

    private buildReasoning(assessment: RiskAssessment): string {
        const parts: string[] = [];

        parts.push(
            "Composite risk score: " + assessment.compositeScore +
            "/100 (" + assessment.riskLevel + ")."
        );

        const activeSignals = assessment.signals.filter((s) => s.score > 0);
        if (activeSignals.length > 0) {
            const signalList = activeSignals
                .map((s) => s.category + " [" + s.severity + "]")
                .join(", ");
            parts.push("Active signals (" + activeSignals.length + "): " + signalList + ".");

            const highest = activeSignals.sort((a, b) => b.score - a.score)[0];
            parts.push("Primary concern: " + highest.description);
        } else {
            parts.push("No risk signals triggered.");
        }

        parts.push("Recommendation: " + assessment.recommendation + ".");

        return parts.join(" ");
    }
}
