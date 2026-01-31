"use client";

import { useState } from "react";
import { useT } from '@/lib/i18n/locale-context';
import styles from "./conversations.module.css";

type Message = { sender: "user" | "supplier" | "ai"; text: string; time: string };
type Conversation = {
  id: string; subject: string; supplier: string; status: "Open" | "Pending" | "Resolved" | "Closed";
  lastMessage: string; lastTime: string; messages: Message[];
  suggestedResponses: string[];
};

const conversations: Conversation[] = [
  {
    id: "CONV-001", subject: "Q2 License Renewal Terms", supplier: "Acme Corp", status: "Open",
    lastMessage: "We can offer a 15% discount for a 2-year commitment.", lastTime: "2h ago",
    messages: [
      { sender: "user", text: "Hi Sarah, we'd like to discuss the Q2 license renewal. Our current agreement expires in March.", time: "Jan 28, 9:00 AM" },
      { sender: "supplier", text: "Thanks for reaching out! I'd be happy to discuss renewal options. We have a few new tiers available.", time: "Jan 28, 9:45 AM" },
      { sender: "ai", text: "Based on usage patterns, Acme Corp's Enterprise tier matches your needs. Current spend: $180K/yr. Market benchmark: $165K/yr for similar scope.", time: "Jan 28, 9:46 AM" },
      { sender: "user", text: "Could you share the pricing for the Enterprise tier? We're also interested in multi-year options.", time: "Jan 28, 10:15 AM" },
      { sender: "supplier", text: "We can offer a 15% discount for a 2-year commitment. That brings Enterprise to $153K/yr.", time: "Jan 28, 11:30 AM" },
    ],
    suggestedResponses: ["Accept the 2-year offer", "Counter with 3-year at 20% discount", "Request detailed feature comparison"],
  },
  {
    id: "CONV-002", subject: "Delivery Delay - PO-2024-0445", supplier: "Global Logistics Inc", status: "Open",
    lastMessage: "We expect shipment to arrive by February 3rd.", lastTime: "4h ago",
    messages: [
      { sender: "user", text: "We noticed PO-2024-0445 hasn't been delivered yet. Can you provide an update?", time: "Jan 27, 2:00 PM" },
      { sender: "supplier", text: "Apologies for the delay. There was a port congestion issue. We expect shipment to arrive by February 3rd.", time: "Jan 27, 3:30 PM" },
      { sender: "ai", text: "This supplier has had 3 delivery delays in the past 6 months. Consider requesting expedited shipping credit. Historical data suggests 2-day buffer on their estimates.", time: "Jan 27, 3:31 PM" },
    ],
    suggestedResponses: ["Request expedited shipping", "Ask for delivery credit", "Accept revised timeline"],
  },
  {
    id: "CONV-003", subject: "Invoice Discrepancy INV-2024-0945", supplier: "TechVault Solutions", status: "Pending",
    lastMessage: "Checking with our billing team on the line item difference.", lastTime: "1d ago",
    messages: [
      { sender: "ai", text: "Detected discrepancy: INV-2024-0945 shows $51,000 but PO-2024-0312 authorized $48,500. Difference: $2,500 on line item 'Additional API Calls'.", time: "Jan 26, 8:00 AM" },
      { sender: "user", text: "Hi, we found a $2,500 discrepancy on invoice INV-2024-0945. The PO only authorized $48,500.", time: "Jan 26, 9:15 AM" },
      { sender: "supplier", text: "Checking with our billing team on the line item difference. Will get back to you by end of day.", time: "Jan 26, 11:00 AM" },
    ],
    suggestedResponses: ["Follow up on status", "Escalate to management", "Request corrected invoice"],
  },
  {
    id: "CONV-004", subject: "SOC 2 Report Request", supplier: "SecureNet Systems", status: "Resolved",
    lastMessage: "Report attached. Let us know if you need anything else.", lastTime: "3d ago",
    messages: [
      { sender: "user", text: "Could you share your latest SOC 2 Type II report? We need it for our annual compliance review.", time: "Jan 24, 10:00 AM" },
      { sender: "supplier", text: "Of course! I'll have it sent over within 24 hours.", time: "Jan 24, 10:30 AM" },
      { sender: "supplier", text: "Report attached. Let us know if you need anything else.", time: "Jan 25, 9:00 AM" },
    ],
    suggestedResponses: [],
  },
  {
    id: "CONV-005", subject: "Bulk Pricing Request", supplier: "SilverLine Packaging", status: "Open",
    lastMessage: "For orders over 10,000 units we can offer 22% off list.", lastTime: "5h ago",
    messages: [
      { sender: "user", text: "We're planning to increase our Q2 order volume by 40%. Can we discuss bulk pricing?", time: "Jan 28, 8:00 AM" },
      { sender: "supplier", text: "Great to hear! For orders over 10,000 units we can offer 22% off list.", time: "Jan 28, 1:00 PM" },
    ],
    suggestedResponses: ["Request formal quote", "Negotiate 25% discount", "Ask about payment terms flexibility"],
  },
  {
    id: "CONV-006", subject: "Quality Issue - Batch #7891", supplier: "Prime Manufacturing", status: "Pending",
    lastMessage: "Our QA team is investigating. We'll provide root cause analysis.", lastTime: "6h ago",
    messages: [
      { sender: "ai", text: "Quality alert: Batch #7891 from Prime Manufacturing failed incoming inspection. Defect rate: 8.2% vs acceptable 2%. Recommended: hold payment on INV-2024-0867.", time: "Jan 27, 7:00 AM" },
      { sender: "user", text: "We've identified quality issues with Batch #7891. Defect rate is 8.2% vs our 2% threshold. Please investigate.", time: "Jan 27, 9:00 AM" },
      { sender: "supplier", text: "Our QA team is investigating. We'll provide root cause analysis by Thursday.", time: "Jan 27, 12:00 PM" },
    ],
    suggestedResponses: ["Request replacement shipment", "Demand credit for defective items", "Schedule quality review meeting"],
  },
  {
    id: "CONV-007", subject: "Contract Amendment - Service Level", supplier: "CloudFirst Hosting", status: "Resolved",
    lastMessage: "Amendment signed and filed. New SLA effective Feb 1.", lastTime: "5d ago",
    messages: [
      { sender: "user", text: "We need to upgrade our SLA to 99.99% uptime. What would that cost?", time: "Jan 20, 11:00 AM" },
      { sender: "supplier", text: "The premium SLA tier is an additional $800/month. Includes priority support.", time: "Jan 20, 2:00 PM" },
      { sender: "user", text: "Approved. Please send the amendment.", time: "Jan 21, 9:00 AM" },
      { sender: "supplier", text: "Amendment signed and filed. New SLA effective Feb 1.", time: "Jan 23, 10:00 AM" },
    ],
    suggestedResponses: [],
  },
  {
    id: "CONV-008", subject: "New Supplier Onboarding", supplier: "FastTrack Couriers", status: "Open",
    lastMessage: "We've submitted the W-9 and insurance certificates.", lastTime: "8h ago",
    messages: [
      { sender: "user", text: "Welcome to our vendor program! Please submit the following: W-9, COI, bank details for ACH.", time: "Jan 25, 9:00 AM" },
      { sender: "supplier", text: "Thanks! We've submitted the W-9 and insurance certificates. Bank details to follow.", time: "Jan 28, 10:00 AM" },
      { sender: "ai", text: "Onboarding progress: 2/3 documents received. Pending: Bank details for ACH setup. Estimated completion: 2 business days.", time: "Jan 28, 10:01 AM" },
    ],
    suggestedResponses: ["Send bank detail form link", "Schedule onboarding call", "Remind about pending documents"],
  },
  {
    id: "CONV-009", subject: "Payment Terms Renegotiation", supplier: "EcoSupply Partners", status: "Pending",
    lastMessage: "We need to discuss moving from Net 45 to Net 60 due to cash flow.", lastTime: "2d ago",
    messages: [
      { sender: "supplier", text: "We need to discuss moving from Net 45 to Net 60 due to cash flow constraints this quarter.", time: "Jan 26, 3:00 PM" },
      { sender: "ai", text: "Risk alert: EcoSupply Partners requesting extended payment terms may indicate financial stress. Their risk score recently increased to 55. Recommend requesting current financial statements.", time: "Jan 26, 3:01 PM" },
    ],
    suggestedResponses: ["Request financial statements", "Offer Net 45 with early pay discount", "Decline and maintain Net 45"],
  },
  {
    id: "CONV-010", subject: "Annual Business Review Scheduling", supplier: "Vertex Consulting", status: "Closed",
    lastMessage: "QBR scheduled for February 15 at 2:00 PM.", lastTime: "1w ago",
    messages: [
      { sender: "user", text: "Let's schedule our annual business review. Are you available the week of Feb 10?", time: "Jan 20, 10:00 AM" },
      { sender: "supplier", text: "Feb 15 at 2:00 PM works for us. We'll prepare a performance summary.", time: "Jan 20, 4:00 PM" },
      { sender: "user", text: "Perfect. QBR scheduled for February 15 at 2:00 PM. Calendar invite sent.", time: "Jan 21, 9:00 AM" },
    ],
    suggestedResponses: [],
  },
  {
    id: "CONV-011", subject: "Compliance Certification Renewal", supplier: "NovaPharma Ltd", status: "Open",
    lastMessage: "Our ISO 13485 renewal is in progress. Expected completion: Feb 28.", lastTime: "12h ago",
    messages: [
      { sender: "ai", text: "Compliance alert: NovaPharma's ISO 13485 certification expires March 15. Action needed to ensure continuity.", time: "Jan 27, 8:00 AM" },
      { sender: "user", text: "We noticed your ISO 13485 is expiring soon. Can you confirm the renewal timeline?", time: "Jan 27, 10:00 AM" },
      { sender: "supplier", text: "Our ISO 13485 renewal is in progress. Expected completion: Feb 28.", time: "Jan 28, 6:00 AM" },
    ],
    suggestedResponses: ["Request renewal confirmation letter", "Add to compliance tracking calendar", "Acknowledge and monitor"],
  },
];

function getBadgeClass(status: string) {
  const map: Record<string, string> = {
    Open: styles.badgeOpen,
    Pending: styles.badgePending,
    Resolved: styles.badgeResolved,
    Closed: styles.badgeClosed,
  };
  return map[status] || styles.badgeClosed;
}

function getMessageClass(sender: string) {
  if (sender === "user") return styles.messageUser;
  if (sender === "supplier") return styles.messageSupplier;
  return styles.messageAI;
}

function getLabelClass(sender: string) {
  if (sender === "user") return styles.messageLabelUser;
  if (sender === "supplier") return styles.messageLabelSupplier;
  return styles.messageLabelAI;
}

function getSenderLabel(sender: string) {
  if (sender === "user") return "You";
  if (sender === "supplier") return "Supplier";
  return "Medius AI";
}

export default function ConversationsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState("All");
  const [selectedId, setSelectedId] = useState(conversations[0].id);

  const tabs = ["All", "Open", "Pending", "Resolved", "Closed"];

  const filtered = activeTab === "All" ? conversations : conversations.filter((c) => c.status === activeTab);
  const selected = conversations.find((c) => c.id === selectedId) || conversations[0];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>{t('supplierConversations.title')}</h1>
          <p>{t('supplierConversations.subtitle')}</p>
        </div>
        <button className={styles.newButton}>+ {t('supplierConversations.newMessage')}</button>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Open</div>
          <div className={styles.statValue}>14</div>
          <div className={styles.statSub}>Awaiting response</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('supplierConversations.lastMessage')}</div>
          <div className={styles.statValue}>4.2h</div>
          <div className={styles.statSub}>Down from 6.1h</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>AI-Resolved</div>
          <div className={styles.statValue} style={{ color: "#23C343" }}>67%</div>
          <div className={styles.statSub}>Automated resolution rate</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('common.pending')}</div>
          <div className={styles.statValue} style={{ color: "#FF9A2E" }}>8</div>
          <div className={styles.statSub}>Awaiting supplier reply</div>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.listPanel}>
          {filtered.map((conv) => (
            <div
              key={conv.id}
              className={selectedId === conv.id ? styles.convItemActive : styles.convItem}
              onClick={() => setSelectedId(conv.id)}
            >
              <div className={styles.convHeader}>
                <span className={styles.convSubject}>
                  {conv.subject}
                  <span className={`${styles.convBadge} ${getBadgeClass(conv.status)}`}>{conv.status}</span>
                </span>
                <span className={styles.convTime}>{conv.lastTime}</span>
              </div>
              <div className={styles.convSupplier}>{conv.supplier}</div>
              <div className={styles.convPreview}>{conv.lastMessage}</div>
            </div>
          ))}
        </div>

        <div className={styles.detailPanel}>
          <div className={styles.detailHeader}>
            <div className={styles.detailTitle}>{selected.subject}</div>
            <div className={styles.detailMeta}>
              <span>{selected.supplier}</span>
              <span>{selected.id}</span>
              <span className={`${styles.convBadge} ${getBadgeClass(selected.status)}`}>{selected.status}</span>
            </div>
          </div>

          <div className={styles.messages}>
            {selected.messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${getMessageClass(msg.sender)}`}>
                <div className={`${styles.messageLabel} ${getLabelClass(msg.sender)}`}>
                  {getSenderLabel(msg.sender)}
                </div>
                {msg.text}
                <div className={styles.messageTime}>{msg.time}</div>
              </div>
            ))}
          </div>

          {selected.suggestedResponses.length > 0 && (
            <div className={styles.suggestedResponses}>
              <div className={styles.suggestedLabel}>AI Suggested Responses</div>
              <div className={styles.suggestedButtons}>
                {selected.suggestedResponses.map((resp, i) => (
                  <button key={i} className={styles.suggestedBtn}>{resp}</button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.replyBox}>
            <input className={styles.replyInput} type="text" placeholder="Type your message..." />
            <button className={styles.sendBtn}>{t('copilot.send')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
