import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument } from "@/core/types";

interface SpendInsight {
    category: string;
    currentSpend: number;
    previousPeriodSpend: number;
    changePercent: number;
    trend: "increasing" | "decreasing" | "stable";
}

interface CashFlowForecast {
    period: string;
    projectedOutflow: number;
    projectedInflow: number;
    netPosition: number;
}

interface Optimization {
    type: "early_payment_discount" | "payment_timing" | "vendor_consolidation" | "spend_reallocation";
    description: string;
    estimatedSavings: number;
    confidence: number;
}

interface AdvisoryReport {
    spendInsights: SpendInsight[];
    cashFlowForecast: CashFlowForecast[];
    optimizations: Optimization[];
    summary: string;
}

export class AdvisoryAgent extends BaseAgent {
    constructor() {
        super("agent-advisory", "Financial Advisory Agent", [
            "spend_analysis",
            "cash_flow_forecasting",
            "optimization_recommendations",
            "trend_detection",
        ]);
    }

    async process(
        document: FinancialDocument,
        context: AgentContext
    ): Promise<AgentDecision> {
        // Simulate analytical processing
        await new Promise((resolve) => setTimeout(resolve, 900));

        const report = this.generateAdvisoryReport(document, context);

        const hasActionableInsights = report.optimizations.length > 0;
        const totalSavings = report.optimizations.reduce(
            (sum, o) => sum + o.estimatedSavings, 0
        );

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action: hasActionableInsights
                ? "advisory_insights_generated"
                : "advisory_no_action",
            reasoning: this.buildReasoning(report, totalSavings),
            confidenceScore: 0.85,
            outcome: "executed",
        };
    }

    private generateAdvisoryReport(
        document: FinancialDocument,
        context: AgentContext
    ): AdvisoryReport {
        const vendorName = document.extractedData?.header.vendorName || "Unknown Vendor";
        const amount = document.extractedData?.header.totalAmount?.amount || 0;

        const spendInsights = this.analyzeSpendPatterns(vendorName, amount);
        const cashFlowForecast = this.forecastCashFlow(amount);
        const optimizations = this.identifyOptimizations(document, context, spendInsights);
        const summary = this.generateSummary(spendInsights, cashFlowForecast, optimizations);

        return { spendInsights, cashFlowForecast, optimizations, summary };
    }

    private analyzeSpendPatterns(vendorName: string, currentAmount: number): SpendInsight[] {
        const categories = [
            "Software & SaaS",
            "Professional Services",
            "Office Supplies",
            "Logistics & Shipping",
            "Utilities",
        ];

        return categories.map((category) => {
            const baseSpend = Math.random() * 50000 + 5000;
            const previousSpend = baseSpend * (0.8 + Math.random() * 0.4);
            const currentSpend = category === "Software & SaaS"
                ? baseSpend + currentAmount
                : baseSpend;
            const changePercent = ((currentSpend - previousSpend) / previousSpend) * 100;

            let trend: SpendInsight["trend"];
            if (changePercent > 5) trend = "increasing";
            else if (changePercent < -5) trend = "decreasing";
            else trend = "stable";

            return {
                category,
                currentSpend: Math.round(currentSpend * 100) / 100,
                previousPeriodSpend: Math.round(previousSpend * 100) / 100,
                changePercent: Math.round(changePercent * 10) / 10,
                trend,
            };
        });
    }

    private forecastCashFlow(currentInvoiceAmount: number): CashFlowForecast[] {
        const forecasts: CashFlowForecast[] = [];
        const now = new Date();

        for (let i = 0; i < 4; i++) {
            const period = new Date(now);
            period.setDate(period.getDate() + 7 * (i + 1));
            const weekLabel = "Week " + (i + 1) + " (" + period.toISOString().split("T")[0] + ")";

            const baseOutflow = 75000 + Math.random() * 50000;
            const projectedOutflow = i === 0
                ? baseOutflow + currentInvoiceAmount
                : baseOutflow;
            const projectedInflow = 80000 + Math.random() * 60000;

            forecasts.push({
                period: weekLabel,
                projectedOutflow: Math.round(projectedOutflow * 100) / 100,
                projectedInflow: Math.round(projectedInflow * 100) / 100,
                netPosition: Math.round((projectedInflow - projectedOutflow) * 100) / 100,
            });
        }

        return forecasts;
    }

    private identifyOptimizations(
        document: FinancialDocument,
        context: AgentContext,
        spendInsights: SpendInsight[]
    ): Optimization[] {
        const optimizations: Optimization[] = [];
        const amount = document.extractedData?.header.totalAmount?.amount || 0;

        // 1. Early payment discount opportunity
        if (amount > 500) {
            const discountRate = 0.02;
            const annualizedReturn = 0.365;
            optimizations.push({
                type: "early_payment_discount",
                description: "Early payment discount available: 2/10 Net 30 on $" +
                    amount.toFixed(2) + ". Annualized return of " +
                    (annualizedReturn * 100).toFixed(1) + "% exceeds cost of capital.",
                estimatedSavings: Math.round(amount * discountRate * 100) / 100,
                confidence: 0.9,
            });
        }

        // 2. Payment timing optimization
        const paymentDecision = context.previousDecisions.find(
            (d) => d.agentId === "agent-payment"
        );
        if (!paymentDecision) {
            optimizations.push({
                type: "payment_timing",
                description: "Batch this invoice with 3 other pending invoices to the same vendor to reduce transaction fees and consolidate payments.",
                estimatedSavings: 25.0,
                confidence: 0.75,
            });
        }

        // 3. Vendor consolidation opportunity
        const increasingCategories = spendInsights.filter(
            (s) => s.trend === "increasing" && s.changePercent > 15
        );
        if (increasingCategories.length > 0) {
            const category = increasingCategories[0];
            optimizations.push({
                type: "vendor_consolidation",
                description: category.category + " spend increased " +
                    category.changePercent + "% vs prior period. Consider consolidating vendors for volume discount (estimated 5-8% savings).",
                estimatedSavings: Math.round(category.currentSpend * 0.06 * 100) / 100,
                confidence: 0.65,
            });
        }

        // 4. Spend reallocation suggestion
        if (amount > 10000) {
            optimizations.push({
                type: "spend_reallocation",
                description: "High-value invoice detected. Consider splitting across budget periods or negotiating installment terms to improve cash flow management.",
                estimatedSavings: 0,
                confidence: 0.6,
            });
        }

        return optimizations;
    }

    private generateSummary(
        spendInsights: SpendInsight[],
        cashFlow: CashFlowForecast[],
        optimizations: Optimization[]
    ): string {
        const totalSavings = optimizations.reduce((sum, o) => sum + o.estimatedSavings, 0);
        const negativeCashFlowWeeks = cashFlow.filter((f) => f.netPosition < 0);
        const parts: string[] = [];

        parts.push("Analyzed spend across " + spendInsights.length + " categories.");

        const increasingCount = spendInsights.filter((s) => s.trend === "increasing").length;
        if (increasingCount > 0) {
            parts.push(increasingCount + " categories showing upward spend trend.");
        }

        if (negativeCashFlowWeeks.length > 0) {
            parts.push("Cash flow alert: " + negativeCashFlowWeeks.length + " of 4 forecast weeks show negative net position.");
        } else {
            parts.push("Cash flow forecast positive across all periods.");
        }

        if (totalSavings > 0) {
            parts.push(optimizations.length + " optimization(s) identified with total estimated savings of $" + totalSavings.toFixed(2) + ".");
        }

        return parts.join(" ");
    }

    private buildReasoning(report: AdvisoryReport, totalSavings: number): string {
        const parts: string[] = [];

        parts.push(report.summary);

        if (report.optimizations.length > 0) {
            const topOptimization = report.optimizations.sort(
                (a, b) => b.estimatedSavings - a.estimatedSavings
            )[0];
            parts.push("Top recommendation: " + topOptimization.description);
        }

        if (totalSavings > 0) {
            parts.push("Total actionable savings: $" + totalSavings.toFixed(2) + ".");
        }

        return parts.join(" ");
    }
}
