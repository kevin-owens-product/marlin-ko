import { BaseAgent, AgentContext } from "./base";
import { AgentDecision, FinancialDocument } from "@/core/types";

type CommunicationType =
    | "missing_info_request"
    | "payment_status_update"
    | "dispute_response"
    | "receipt_confirmation"
    | "remittance_advice";

interface CommunicationDraft {
    type: CommunicationType;
    recipientName: string;
    recipientEmail: string;
    subject: string;
    body: string;
    tone: "professional" | "urgent" | "friendly";
    autoSendEligible: boolean;
}

export class CommunicationAgent extends BaseAgent {
    constructor() {
        super("agent-communication", "Supplier Communication Agent", [
            "response_generation",
            "missing_info_requests",
            "payment_updates",
            "dispute_responses",
            "remittance_advice",
        ]);
    }

    async process(
        document: FinancialDocument,
        context: AgentContext
    ): Promise<AgentDecision> {
        // Simulate AI-powered communication generation
        await new Promise((resolve) => setTimeout(resolve, 500));

        const communicationType = this.determineCommunicationType(document, context);
        const draft = this.generateCommunication(document, context, communicationType);

        const action = draft.autoSendEligible
            ? "communication_auto_sent"
            : "communication_drafted";

        return {
            id: crypto.randomUUID(),
            agentId: this.id,
            documentId: document.id,
            timestamp: new Date().toISOString(),
            action,
            reasoning: this.buildReasoning(draft),
            confidenceScore: draft.autoSendEligible ? 0.95 : 0.80,
            outcome: draft.autoSendEligible ? "executed" : "queued_for_review",
        };
    }

    private determineCommunicationType(
        document: FinancialDocument,
        context: AgentContext
    ): CommunicationType {
        const decisions = context.previousDecisions;

        const complianceBlocked = decisions.find(
            (d) => d.agentId === "agent-compliance" && d.outcome === "blocked"
        );
        if (complianceBlocked) return "dispute_response";

        const matchException = decisions.find(
            (d) => d.agentId === "agent-matching" && d.action === "match_exception"
        );
        if (matchException) return "missing_info_request";

        const paymentScheduled = decisions.find(
            (d) => d.agentId === "agent-payment" && d.action === "schedule_payment"
        );
        if (paymentScheduled) return "payment_status_update";

        const hasExtractedData = document.extractedData?.header.invoiceNumber;
        if (hasExtractedData) return "receipt_confirmation";

        return "missing_info_request";
    }

    private generateCommunication(
        document: FinancialDocument,
        context: AgentContext,
        type: CommunicationType
    ): CommunicationDraft {
        const vendorName = document.extractedData?.header.vendorName || "Valued Supplier";
        const vendorEmail = document.metadata?.senderEmail || "supplier@example.com";
        const invoiceNumber = document.extractedData?.header.invoiceNumber || "N/A";
        const amount = document.extractedData?.header.totalAmount?.amount?.toFixed(2) || "0.00";

        switch (type) {
            case "missing_info_request":
                return {
                    type,
                    recipientName: vendorName,
                    recipientEmail: vendorEmail,
                    subject: "Action Required: Additional Information Needed for Invoice " + invoiceNumber,
                    body: this.templateMissingInfo(vendorName, invoiceNumber, amount),
                    tone: "professional",
                    autoSendEligible: false,
                };

            case "payment_status_update":
                return {
                    type,
                    recipientName: vendorName,
                    recipientEmail: vendorEmail,
                    subject: "Payment Scheduled: Invoice " + invoiceNumber,
                    body: this.templatePaymentUpdate(vendorName, invoiceNumber, amount),
                    tone: "friendly",
                    autoSendEligible: true,
                };

            case "dispute_response":
                return {
                    type,
                    recipientName: vendorName,
                    recipientEmail: vendorEmail,
                    subject: "Invoice " + invoiceNumber + " - Compliance Issue Identified",
                    body: this.templateDisputeResponse(vendorName, invoiceNumber, context),
                    tone: "professional",
                    autoSendEligible: false,
                };

            case "receipt_confirmation":
                return {
                    type,
                    recipientName: vendorName,
                    recipientEmail: vendorEmail,
                    subject: "Invoice " + invoiceNumber + " Received and Being Processed",
                    body: this.templateReceiptConfirmation(vendorName, invoiceNumber, amount),
                    tone: "friendly",
                    autoSendEligible: true,
                };

            case "remittance_advice":
                return {
                    type,
                    recipientName: vendorName,
                    recipientEmail: vendorEmail,
                    subject: "Remittance Advice: Payment for Invoice " + invoiceNumber,
                    body: this.templateRemittanceAdvice(vendorName, invoiceNumber, amount),
                    tone: "professional",
                    autoSendEligible: true,
                };
        }
    }

    private templateMissingInfo(vendor: string, invoiceNum: string, amount: string): string {
        return [
            "Dear " + vendor + ",",
            "",
            "We have received your invoice " + invoiceNum + " for $" + amount + ". However, we require additional information to complete processing:",
            "",
            "- Purchase Order number is missing or does not match our records",
            "- Please verify the line item descriptions and quantities",
            "- Confirm the payment terms applicable to this invoice",
            "",
            "Please reply to this email with the requested information at your earliest convenience.",
            "",
            "Thank you for your prompt attention to this matter.",
            "",
            "Best regards,",
            "Medius Accounts Payable",
        ].join("\n");
    }

    private templatePaymentUpdate(vendor: string, invoiceNum: string, amount: string): string {
        const payDate = new Date();
        payDate.setDate(payDate.getDate() + 15);

        return [
            "Dear " + vendor + ",",
            "",
            "We are pleased to confirm that your invoice " + invoiceNum + " for $" + amount + " has been approved and scheduled for payment.",
            "",
            "Estimated payment date: " + payDate.toISOString().split("T")[0],
            "Payment method: ACH Direct Deposit",
            "",
            "You will receive a remittance advice once payment has been processed.",
            "",
            "Best regards,",
            "Medius Accounts Payable",
        ].join("\n");
    }

    private templateDisputeResponse(
        vendor: string,
        invoiceNum: string,
        context: AgentContext
    ): string {
        const complianceDecision = context.previousDecisions.find(
            (d) => d.agentId === "agent-compliance"
        );
        const issue = complianceDecision?.reasoning || "a compliance validation issue";

        return [
            "Dear " + vendor + ",",
            "",
            "During our automated review of invoice " + invoiceNum + ", we identified the following issue:",
            "",
            "Issue: " + issue,
            "",
            "To resolve this, please:",
            "1. Review the invoice for the identified issue",
            "2. Submit a corrected invoice referencing the original invoice number",
            "3. Include any supporting documentation",
            "",
            "If you believe this is in error, please contact our AP team directly and we will review manually.",
            "",
            "Best regards,",
            "Medius Accounts Payable",
        ].join("\n");
    }

    private templateReceiptConfirmation(
        vendor: string,
        invoiceNum: string,
        amount: string
    ): string {
        return [
            "Dear " + vendor + ",",
            "",
            "This is to confirm that we have received your invoice " + invoiceNum + " for $" + amount + ".",
            "",
            "The invoice is currently being processed through our automated review system. You will receive an update once processing is complete.",
            "",
            "Reference ID: " + crypto.randomUUID().split("-")[0].toUpperCase(),
            "",
            "Best regards,",
            "Medius Accounts Payable",
        ].join("\n");
    }

    private templateRemittanceAdvice(
        vendor: string,
        invoiceNum: string,
        amount: string
    ): string {
        return [
            "Dear " + vendor + ",",
            "",
            "Please find below remittance details for recent payment:",
            "",
            "Invoice: " + invoiceNum,
            "Amount: $" + amount,
            "Payment Date: " + new Date().toISOString().split("T")[0],
            "Method: ACH Direct Deposit",
            "Reference: PAY-" + (Math.floor(Math.random() * 900000) + 100000),
            "",
            "If you have any questions regarding this payment, please contact our AP team.",
            "",
            "Best regards,",
            "Medius Accounts Payable",
        ].join("\n");
    }

    private buildReasoning(draft: CommunicationDraft): string {
        const parts: string[] = [];

        parts.push("Generated " + draft.type.replace(/_/g, " ") + " communication for " + draft.recipientName + ".");
        parts.push('Subject: "' + draft.subject + '".');
        parts.push("Tone: " + draft.tone + ".");

        if (draft.autoSendEligible) {
            parts.push("Communication meets auto-send criteria. Dispatched automatically.");
        } else {
            parts.push("Communication requires human review before sending due to sensitive content.");
        }

        return parts.join(" ");
    }
}
