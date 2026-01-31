import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument } from "@/core/types";

interface MatchResult {
    matchType: "2-way" | "3-way";
    poNumber: string | null;
    receiptNumber: string | null;
    invoiceVariance: number;
    tolerancePercent: number;
    withinTolerance: boolean;
    lineItemMatches: LineItemMatch[];
    overallScore: number;
}

interface LineItemMatch {
    lineDescription: string;
    invoiceAmount: number;
    poAmount: number;
    variance: number;
    variancePercent: number;
    matched: boolean;
}

export class MatchingAgent extends BaseAgent {
    private readonly defaultTolerancePercent = 2.0;

    constructor() {
        super("agent-matching", "Matching Agent", [
            "po_matching",
            "2_way_match",
            "3_way_match",
            "variance_calculation",
            "tolerance_rules",
        ]);
    }

    async process(
        document: FinancialDocument,
        context: AgentContext
    ): Promise<AgentDecision> {
        // Simulate processing time for PO lookup and matching
        await new Promise((resolve) => setTimeout(resolve, 700));

        const matchResult = this.performMatching(document);

        const action = matchResult.withinTolerance
            ? "match_confirmed"
            : "match_exception";

        const reasoning = this.buildReasoning(matchResult);

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action,
            reasoning,
            confidenceScore: matchResult.overallScore,
            outcome: matchResult.withinTolerance
                ? "executed"
                : matchResult.overallScore > 0.5
                  ? "queued_for_review"
                  : "blocked",
        };
    }

    private performMatching(document: FinancialDocument): MatchResult {
        const header = document.extractedData?.header;
        const lineItems = document.extractedData?.lineItems || [];
        const totalAmount = header?.totalAmount?.amount || 0;

        const hasPO = Math.random() > 0.15;
        const hasReceipt = hasPO && Math.random() > 0.3;
        const matchType: "2-way" | "3-way" = hasReceipt ? "3-way" : "2-way";

        const poNumber = hasPO
            ? "PO-" + (Math.floor(Math.random() * 90000) + 10000)
            : null;
        const receiptNumber = hasReceipt
            ? "RCV-" + (Math.floor(Math.random() * 90000) + 10000)
            : null;

        const lineItemMatches: LineItemMatch[] = lineItems.map((item) => {
            const varianceFactor = (Math.random() - 0.5) * 0.06;
            const poAmount = item.totalAmount * (1 + varianceFactor);
            const variance = item.totalAmount - poAmount;
            const variancePercent = Math.abs(variance / poAmount) * 100;

            return {
                lineDescription: item.description,
                invoiceAmount: item.totalAmount,
                poAmount: Math.round(poAmount * 100) / 100,
                variance: Math.round(variance * 100) / 100,
                variancePercent: Math.round(variancePercent * 100) / 100,
                matched: variancePercent <= this.defaultTolerancePercent,
            };
        });

        const totalPOAmount = lineItemMatches.reduce(
            (sum, m) => sum + m.poAmount, 0
        );
        const invoiceVariance = totalPOAmount > 0
            ? Math.abs(totalAmount - totalPOAmount) / totalPOAmount
            : 0;

        const withinTolerance = hasPO
            && invoiceVariance * 100 <= this.defaultTolerancePercent
            && lineItemMatches.every((m) => m.matched);

        let overallScore = 0;
        if (!hasPO) {
            overallScore = 0.3;
        } else if (withinTolerance) {
            overallScore = matchType === "3-way" ? 0.99 : 0.92;
        } else {
            const matchedCount = lineItemMatches.filter((m) => m.matched).length;
            overallScore = lineItemMatches.length > 0
                ? 0.5 + (matchedCount / lineItemMatches.length) * 0.4
                : 0.5;
        }

        return {
            matchType,
            poNumber,
            receiptNumber,
            invoiceVariance: Math.round(invoiceVariance * 10000) / 100,
            tolerancePercent: this.defaultTolerancePercent,
            withinTolerance,
            lineItemMatches,
            overallScore: Math.round(overallScore * 100) / 100,
        };
    }

    private buildReasoning(result: MatchResult): string {
        const parts: string[] = [];

        if (!result.poNumber) {
            parts.push("No matching Purchase Order found in system.");
            parts.push("Invoice requires manual PO assignment or non-PO approval workflow.");
            return parts.join(" ");
        }

        const matchLabel = result.matchType === "3-way" ? "3-way" : "2-way";
        const receiptPart = result.receiptNumber
            ? " and " + result.receiptNumber
            : "";
        parts.push(
            matchLabel + " match performed against " +
            result.poNumber + receiptPart + "."
        );
        parts.push(
            "Overall variance: " + result.invoiceVariance +
            "% (tolerance: " + result.tolerancePercent + "%)."
        );

        const matchedLines = result.lineItemMatches.filter((m) => m.matched).length;
        const totalLines = result.lineItemMatches.length;
        parts.push("Line items matched: " + matchedLines + "/" + totalLines + ".");

        if (result.withinTolerance) {
            parts.push("All variances within tolerance. Match confirmed.");
        } else {
            const exceptions = result.lineItemMatches
                .filter((m) => !m.matched)
                .map((m) => m.lineDescription + " (" + m.variancePercent + "% variance)");
            parts.push("Exceptions on: " + exceptions.join(", ") + ". Routing for review.");
        }

        return parts.join(" ");
    }
}
