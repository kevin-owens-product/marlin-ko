# Medius Platform PRD Suite
## Strategic Improvements & New Capabilities

**Version 1.0 | January 2026**

*AI-native transformation, payment monetization, compliance automation, and next-generation platform capabilities*

---

## Executive Summary

This document suite specifies strategic improvements to transform Medius from a leading AP automation platform into an AI-native autonomous finance platform. These capabilities represent the competitive differentiation needed to maintain market leadership against well-funded competitors like Tipalti, Stampli, and BILL.

### Strategic Themes

- **Agentic AI Architecture:** Move from AI-assisted to AI-autonomous processing with specialized agents
- **Payment Monetization:** Transform from cost center to profit contributor through dynamic discounting, SCF, and virtual cards
- **E-Invoicing Compliance:** Own compliance intelligence layer to reduce Pagero dependency and create competitive moat
- **Treasury Adjacency:** Expand into cash visibility and payment timing optimization to elevate CFO relevance
- **Product-Led Growth:** Build self-service infrastructure to capture SMB market and create supplier network effects

### Investment Summary

| Initiative | Investment | Timeline |
|------------|------------|----------|
| Agentic AI Architecture | $15-20M | 18-24 months |
| Payment Monetization Engine | $5-8M | 12-18 months |
| E-Invoicing Compliance Platform | $5-8M | 12 months |
| Treasury Adjacency | $3-5M | 12-18 months |
| Product-Led Growth Infrastructure | $3-5M | 12 months |
| **TOTAL** | **$31-46M** | **24 months** |

---

## Document Index

| PRD # | Improvement Area | Strategic Value |
|-------|------------------|-----------------|
| IMP-001 | Agentic AI Architecture | 🔴 Critical |
| IMP-002 | Dynamic Discounting & SCF | 🔴 Critical |
| IMP-003 | Virtual Card Expansion | 🟡 High |
| IMP-004 | E-Invoicing Compliance Engine | 🔴 Critical |
| IMP-005 | Cash Visibility & Forecasting | 🟡 High |
| IMP-006 | Payment Timing Optimization | 🟡 High |
| IMP-007 | Self-Service Onboarding (PLG) | 🟡 High |
| IMP-008 | Supplier Network Effects | 🟢 Medium |
| IMP-009 | Advanced Analytics & Insights | 🟢 Medium |
| IMP-010 | Ecosystem & Partner Integrations | 🟢 Medium |

---

# IMP-001: Agentic AI Architecture

## Strategic Context

The competitive landscape is rapidly evolving toward autonomous AI agents. Tipalti announced agentic AI capabilities at $8.3B valuation. Stampli has Billy the Bot. BILL launched AgenTeq. To maintain market leadership, Medius must transition from AI-assisted processing to AI-autonomous execution.

### Vision: From Assisted to Autonomous

| Stage | Current State | Target State |
|-------|--------------|--------------|
| **Assisted** | ✅ AI suggests, human decides | Continue for edge cases |
| **Supervised** | Limited—SmartFlow coding | 🟡 AI decides, human reviews exceptions |
| **Autonomous** | ❌ Not available | ✅ AI executes multi-step processes end-to-end |

### Success Metrics

- PO invoice touchless rate: 94.9% → 99%
- Non-PO invoice touchless rate: 80% → 95%
- Exception resolution time: Hours → Minutes
- Agent decision accuracy: >99% with human-equivalent judgment

## Functional Requirements

### FR1.1: Specialized AI Agents

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AG-001 | As a system, I want a Capture Agent that autonomously extracts, validates, and corrects invoice data | P0 | Self-healing extraction; cross-reference validation; confidence-based routing |
| AG-002 | As a system, I want a Classification Agent that codes invoices with expert-level accuracy | P0 | Multi-signal reasoning; explanation generation; continuous learning |
| AG-003 | As a system, I want a Matching Agent that resolves PO discrepancies autonomously | P0 | Intelligent tolerance application; GR correlation; vendor communication |
| AG-004 | As a system, I want a Risk Agent that evaluates fraud probability and recommends actions | P0 | Multi-factor risk scoring; adaptive thresholds; investigation guidance |
| AG-005 | As a system, I want a Communication Agent that handles supplier inquiries end-to-end | P0 | Natural conversation; system integration; escalation judgment |
| AG-006 | As a system, I want an Approval Agent that routes and expedites based on urgency and patterns | P1 | Priority detection; reminder optimization; delegation recommendations |
| AG-007 | As a system, I want a Payment Agent that optimizes payment timing and method selection | P1 | Cash position awareness; discount opportunity detection; method optimization |
| AG-008 | As a system, I want a Compliance Agent that monitors and ensures regulatory adherence | P0 | Real-time validation; format compliance; reporting automation |
| AG-009 | As a system, I want an Advisory Agent that provides proactive insights to finance leaders | P1 | Trend detection; recommendation generation; executive summarization |

### FR1.2: Agent Orchestration

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AG-010 | As a system, I want agents to collaborate on complex invoices requiring multiple capabilities | P0 | Handoff protocols; shared context; conflict resolution |
| AG-011 | As a system, I want agent decisions logged with full reasoning for audit | P0 | Decision audit trail; reasoning explanation; compliance documentation |
| AG-012 | As a system, I want configurable human-in-the-loop thresholds per agent | P0 | Confidence thresholds; exception categories; escalation rules |
| AG-013 | As a system, I want agents to learn from human corrections without retraining | P0 | Online learning; pattern recognition; feedback integration |
| AG-014 | As an admin, I want to enable/disable agents by capability for gradual rollout | P0 | Agent toggles; capability configuration; A/B testing |

### FR1.3: Agent Transparency

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AG-015 | As a user, I want to see why an agent made a specific decision | P0 | Explainable AI; factor contribution; confidence breakdown |
| AG-016 | As a user, I want to override agent decisions with feedback for learning | P0 | Override capability; feedback capture; model update |
| AG-017 | As an admin, I want dashboards showing agent performance and accuracy | P0 | Accuracy metrics; throughput stats; exception analysis |
| AG-018 | As an auditor, I want complete agent decision history for compliance review | P0 | Immutable logs; search capability; export options |

---

# IMP-002: Dynamic Discounting & Supply Chain Finance

## Strategic Context

Payment monetization represents the largest revenue expansion opportunity. Currently, Medius customers capture only 40% of available early payment discounts. Dynamic discounting and SCF integration can generate $375K-$1.15M annual value per $100M in payables—transforming ROI conversations.

### Target Metrics

- Early payment discount capture: 40% → 90%
- Supplier enrollment in dynamic discounting: >30%
- SCF program utilization: >$10M average per customer
- Net new revenue per customer: >$50K annually

## Functional Requirements

### FR2.1: Dynamic Discounting

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| DD-001 | As a payer, I want to offer sliding-scale discounts based on payment acceleration | P0 | Sliding scale calculation; supplier acceptance; automated payment |
| DD-002 | As a supplier, I want to accept/decline discount offers via portal or email | P0 | Self-service portal; email response; mobile-friendly |
| DD-003 | As a system, I want to automatically calculate optimal discount rates | P0 | APY optimization; supplier segmentation; market benchmarking |
| DD-004 | As a payer, I want to set discount budgets and limits by period | P0 | Budget allocation; limit enforcement; rollover rules |
| DD-005 | As a payer, I want to see ROI dashboard showing discount program performance | P0 | Discount captured; supplier participation; comparison to standard terms |
| DD-006 | As a supplier, I want predictable cash flow by auto-accepting discounts above threshold | P1 | Standing offer configuration; minimum rate setting; override capability |

### FR2.2: Supply Chain Finance Integration

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| SCF-001 | As a payer, I want to extend payment terms while suppliers get paid early via SCF | P0 | Bank/funder integration; approved invoice syndication; transparent fees |
| SCF-002 | As a system, I want to integrate with major SCF platforms (Taulia, C2FO, PrimeRevenue) | P0 | API integration; bidirectional data flow; settlement reconciliation |
| SCF-003 | As a supplier, I want to easily enroll in buyer's SCF program | P0 | Self-service enrollment; KYC capture; bank detail verification |
| SCF-004 | As a payer, I want to see DPO impact of SCF program | P0 | DPO calculation; working capital impact; benchmark comparison |
| SCF-005 | As a supplier, I want to choose between discount and SCF options per invoice | P1 | Option comparison; cost transparency; decision support |

---

# IMP-003: Virtual Card Expansion

## Strategic Context

Virtual card payments generate 0.5-1.5% rebates—pure profit for buyers. Current adoption is ~15% of eligible spend. Competitors like Ramp have made card economics central to their value proposition. Expanding virtual card adoption to 40% creates significant monetization opportunity and competitive differentiation.

### Target Metrics

- Virtual card adoption: 15% → 40% of eligible spend
- Supplier card acceptance: 25% → 50% of active suppliers
- Rebate revenue share: Grow to meaningful contribution

## Functional Requirements

### FR3.1: Supplier Enablement

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| VC-001 | As a system, I want to identify suppliers with high card acceptance probability | P0 | ML-based scoring; industry data; historical patterns |
| VC-002 | As a system, I want to automate supplier outreach for card enrollment | P0 | Email campaigns; follow-up automation; conversion tracking |
| VC-003 | As a supplier, I want to enroll in card payments through self-service portal | P0 | Simple enrollment; payment processing setup; FAQ/support |
| VC-004 | As a payer, I want to see supplier card eligibility and enrollment status | P0 | Eligibility dashboard; outreach status; conversion metrics |
| VC-005 | As a system, I want to leverage Paymode network for pre-enrolled suppliers | P0 | Network query; instant enablement; fee transparency |

### FR3.2: Payment Optimization

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| VC-006 | As a system, I want to recommend card vs ACH based on optimization rules | P0 | Method selection algorithm; supplier preference; rebate optimization |
| VC-007 | As a payer, I want to set rules for automatic card payment routing | P0 | Routing rules; supplier tiers; spend categories |
| VC-008 | As a payer, I want to see rebate projections and actuals by period | P0 | Rebate forecasting; actual reporting; variance analysis |
| VC-009 | As a system, I want to handle card declines and fallback to ACH | P0 | Decline handling; automatic fallback; retry logic |
| VC-010 | As a payer, I want to integrate multiple card issuers for optimization | P1 | Multi-issuer support; rebate comparison; issuer selection |

---

# IMP-004: E-Invoicing Compliance Engine

## Strategic Context

E-invoicing mandates are accelerating globally—Belgium (Jan 2026), Poland (Feb 2026), France (Sept 2026). Current Pagero dependency creates strategic risk following Thomson Reuters acquisition uncertainty. Building owned compliance intelligence creates competitive moat and reduces partner dependency.

### Regulatory Timeline (Critical)

| Country | Mandate Date | Requirement |
|---------|--------------|-------------|
| 🔴 **Belgium** | **January 2026** | Peppol BIS 3.0 mandatory for B2B |
| 🔴 **Poland** | **February 2026** | KSeF (National e-Invoice System) |
| 🟡 **France** | **September 2026** | PPF + Factur-X |
| Germany | January 2027 | ZUGFeRD 2.0 / XRechnung |
| EU (ViDA) | July 2030 | Cross-border e-invoicing |

## Functional Requirements

### FR4.1: Compliance Intelligence

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| EI-001 | As a system, I want to validate invoices against 100+ country-specific e-invoice schemas | P0 | Schema library; validation engine; error reporting |
| EI-002 | As a system, I want to monitor regulatory changes and update validation rules automatically | P0 | Regulatory tracking; rule updates; customer notification |
| EI-003 | As a compliance officer, I want dashboards showing compliance status by jurisdiction | P0 | Country coverage; compliance rate; gap analysis |
| EI-004 | As a system, I want to recommend compliant invoice formats based on transaction attributes | P1 | Format recommendation; conversion guidance; validation preview |

### FR4.2: Network Connectivity

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| EI-005 | As a system, I want to operate as a certified Peppol Access Point | P0 | Peppol AP certification; SMP registration; network connectivity |
| EI-006 | As a system, I want direct integration with priority government platforms (PPF, KSeF, SDI) | P0 | Government API integration; certification; fallback routing |
| EI-007 | As a system, I want multi-partner strategy for long-tail coverage | P0 | Pagero + alternatives; routing logic; cost optimization |
| EI-008 | As a customer, I want seamless sending to any e-invoicing network | P0 | Unified interface; automatic routing; delivery confirmation |

### FR4.3: Format Transformation

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| EI-009 | As a system, I want to convert between any supported e-invoice formats | P0 | Lossless conversion; semantic mapping; validation |
| EI-010 | As a system, I want to generate compliant e-invoices from standard invoice data | P0 | Template-based generation; dynamic population; signature application |
| EI-011 | As a system, I want to render e-invoice XML as human-readable documents | P0 | Visual rendering; PDF generation; language localization |
| EI-012 | As a customer, I want hybrid PDF/XML (Factur-X/ZUGFeRD) creation | P0 | Embedded XML; visual PDF; validation |

---

# IMP-005: Cash Visibility & Forecasting

## Strategic Context

CFOs need real-time cash visibility, not just AP data. By integrating bank feeds and providing cash forecasting, Medius elevates from operational tool to strategic finance platform. This creates cross-sell to treasury adjacency without competing with full TMS vendors like Kyriba.

### Target Metrics

- Cash forecast accuracy: >95% at 2-week horizon
- Bank connectivity: 200+ banks via open banking
- Real-time balance visibility: <5 minute refresh

## Functional Requirements

### FR5.1: Bank Connectivity

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| CV-001 | As a treasurer, I want to connect bank accounts via open banking APIs | P0 | Plaid/Yodlee/MX integration; secure OAuth; account selection |
| CV-002 | As a treasurer, I want real-time balance visibility across all accounts | P0 | Multi-bank aggregation; currency consolidation; refresh frequency |
| CV-003 | As a treasurer, I want to see pending transactions and holds | P1 | Pending transaction display; hold detection; cleared/uncleared |
| CV-004 | As a system, I want to reconcile AP payments against bank transactions | P0 | Payment-transaction matching; exception flagging; reconciliation report |

### FR5.2: Cash Forecasting

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| CV-005 | As a treasurer, I want AI-generated cash flow forecasts based on AP and historical patterns | P0 | ML forecasting; scenario modeling; confidence intervals |
| CV-006 | As a treasurer, I want to see scheduled payments and their cash impact | P0 | Payment calendar; cash impact visualization; what-if analysis |
| CV-007 | As a treasurer, I want variance analysis between forecast and actual | P1 | Variance tracking; root cause analysis; forecast improvement |
| CV-008 | As a CFO, I want weekly cash position summaries delivered automatically | P1 | Scheduled reports; executive summary; alert on variances |

---

# IMP-006: Payment Timing Optimization

## Strategic Context

Optimal payment timing balances cash preservation with discount capture. Most companies pay either too early (losing float) or too late (missing discounts). AI-driven payment timing recommendations can optimize working capital while capturing all available discounts.

## Functional Requirements

### FR6.1: Timing Recommendations

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| PT-001 | As a payer, I want AI recommendations on when to pay each invoice | P0 | Optimal date calculation; discount consideration; cash position awareness |
| PT-002 | As a payer, I want to see impact of paying early vs on due date vs late | P0 | Scenario comparison; discount value; late fee risk; supplier relationship |
| PT-003 | As a system, I want to automatically schedule payments for optimal timing | P0 | Auto-scheduling; configurable strategy; override capability |
| PT-004 | As a payer, I want to prioritize critical suppliers during cash constraints | P0 | Supplier prioritization; critical supplier flagging; payment sequencing |
| PT-005 | As a CFO, I want to see working capital impact of payment timing decisions | P0 | DPO tracking; working capital dashboard; trend analysis |

### FR6.2: Cash-Aware Batching

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| PT-006 | As a system, I want to batch payments considering cash availability | P0 | Balance checking; batch size optimization; spreading large payments |
| PT-007 | As a payer, I want to set minimum cash buffer rules | P0 | Buffer configuration; automatic deferral; alert on breach |
| PT-008 | As a system, I want to alert when upcoming payments exceed available cash | P0 | Cash shortfall prediction; advance warning; mitigation options |

---

# IMP-007: Self-Service Onboarding (PLG)

## Strategic Context

Product-Led Growth enables efficient SMB acquisition while generating enterprise leads through the supplier network. Current implementation-heavy model limits TAM and increases CAC. Self-service onboarding unlocks new market segments and creates viral growth mechanics.

### Target Metrics

- Self-service onboarding: <2 hours to first invoice
- Free tier adoption: 10K accounts in year 1
- Free-to-paid conversion: >10%
- CAC reduction: >50% for SMB segment

## Functional Requirements

### FR7.1: Instant Value Demo

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| PLG-001 | As a prospect, I want to see Medius working with my data in <5 minutes | P0 | Upload invoices; see extraction; experience workflow |
| PLG-002 | As a prospect, I want to connect my email and have invoices captured automatically | P0 | Email forwarding setup; inbox scanning; immediate processing |
| PLG-003 | As a prospect, I want to see ROI projection based on my invoice volume | P0 | ROI calculator; processing time savings; cost reduction estimate |

### FR7.2: Freemium Model

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| PLG-004 | As a small business, I want to process 50 invoices/month free forever | P0 | Free tier; usage tracking; upgrade prompts |
| PLG-005 | As a free user, I want to upgrade seamlessly when I exceed limits | P0 | Self-service upgrade; payment processing; instant access |
| PLG-006 | As a prospect, I want transparent pricing without talking to sales (<$50K ACV) | P0 | Online pricing; self-service purchase; instant provisioning |

### FR7.3: Self-Service Configuration

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| PLG-007 | As a new customer, I want guided setup for approval workflows | P0 | Wizard-based setup; templates; testing capability |
| PLG-008 | As a new customer, I want simple ERP connection without IT involvement | P0 | Pre-built connectors; OAuth setup; validation |
| PLG-009 | As a new customer, I want to import my vendor list easily | P0 | CSV upload; enrichment; deduplication |
| PLG-010 | As a new customer, I want in-app tutorials and help | P0 | Interactive tutorials; contextual help; video guides |

---

# IMP-008: Supplier Network Effects

## Strategic Context

Every buyer customer creates supplier touchpoints through the payment portal. Converting these suppliers into prospects creates viral growth loop. Paymode network has 550K+ suppliers—each a potential customer. Network effects create exponential growth opportunity.

## Functional Requirements

### FR8.1: Supplier Portal Enhancement

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| SN-001 | As a supplier, I want a compelling portal experience that showcases Medius value | P0 | Modern UX; feature highlights; conversion CTAs |
| SN-002 | As a supplier, I want to see all my customers who use Medius in one place | P1 | Multi-buyer view; consolidated status; unified inbox |
| SN-003 | As a supplier, I want to manage invoices to all Medius customers from one portal | P1 | Cross-customer invoice submission; status tracking; payment aggregation |

### FR8.2: Viral Growth Mechanics

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| SN-004 | As a system, I want to identify high-potential supplier prospects based on portal activity | P0 | Engagement scoring; company size detection; fit scoring |
| SN-005 | As a system, I want to deliver targeted marketing to supplier portal users | P0 | Permission-based marketing; value messaging; demo CTAs |
| SN-006 | As a system, I want to track supplier-to-customer conversions for attribution | P0 | Conversion tracking; referral attribution; network value calculation |
| SN-007 | As a buyer, I want to refer suppliers with incentives | P1 | Referral program; incentive tracking; mutual benefit |

---

# IMP-009: Advanced Analytics & Insights

## Strategic Context

Data is Medius's moat—$200B annual spend across 4,000+ customers. Transforming this into actionable intelligence creates value beyond process automation. Benchmarking, predictive analytics, and prescriptive recommendations elevate Medius from tool to strategic advisor.

## Functional Requirements

### FR9.1: Benchmarking

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AN-001 | As a CFO, I want to benchmark my AP metrics against industry peers | P0 | Anonymous benchmarks; industry segmentation; percentile ranking |
| AN-002 | As an AP manager, I want to see how my team compares on key KPIs | P0 | Process time comparison; touchless rate comparison; cost per invoice |
| AN-003 | As a finance leader, I want to identify improvement opportunities vs best-in-class | P0 | Gap analysis; improvement recommendations; prioritization |

### FR9.2: Predictive Analytics

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AN-004 | As a controller, I want to predict month-end AP accruals accurately | P0 | Accrual prediction; confidence intervals; variance tracking |
| AN-005 | As a CFO, I want to forecast spend by category for budget planning | P1 | Spend forecasting; seasonal adjustment; variance analysis |
| AN-006 | As a risk manager, I want to predict which suppliers are likely to cause issues | P1 | Supplier risk scoring; early warning; mitigation suggestions |

### FR9.3: Prescriptive Insights

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AN-007 | As a CFO, I want proactive recommendations for cost reduction | P0 | Opportunity identification; impact quantification; action steps |
| AN-008 | As an AP manager, I want AI-generated insights on process bottlenecks | P0 | Bottleneck detection; root cause; resolution suggestions |
| AN-009 | As a controller, I want weekly executive summary of key insights | P1 | Automated summary; key findings; action items |

---

# IMP-010: Ecosystem & Partner Integrations

## Strategic Context

Composable architecture requires ecosystem thinking. Rather than building everything, strategic integrations with best-of-breed solutions expand value while focusing internal investment. Ironclad for contracts, Coupa for enterprise procurement, Avalara for tax—partnerships extend reach.

## Functional Requirements

### FR10.1: Contract Management Integration

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| EC-001 | As a buyer, I want contract terms from Ironclad surfaced during invoice approval | P1 | Ironclad integration; contract term display; price validation |
| EC-002 | As a system, I want to validate invoice prices against contract rates | P0 | Price checking; variance flagging; override workflow |
| EC-003 | As a buyer, I want contract expiration alerts when processing recurring vendor invoices | P1 | Expiration detection; alert generation; renewal prompting |

### FR10.2: Enterprise Procurement Integration

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| EC-004 | As an enterprise customer, I want seamless integration with Coupa procurement | P1 | Coupa connector; PO sync; requisition flow |
| EC-005 | As an enterprise customer, I want integration with SAP Ariba for supplier network | P1 | Ariba network access; invoice exchange; catalog sync |
| EC-006 | As a system, I want to be the AP system of record regardless of procurement source | P0 | Multi-source ingestion; unified processing; consistent workflow |

### FR10.3: Tax & Compliance Integration

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| EC-007 | As a system, I want to integrate with Avalara for tax determination | P1 | Avalara API; rate lookup; compliance documentation |
| EC-008 | As a customer, I want 1099 data automatically sent to my tax filing service | P1 | 1099 data export; filing integration; correction handling |
| EC-009 | As a global customer, I want withholding tax calculation integrated | P1 | WHT rate determination; treaty application; reporting |

---

## Implementation Roadmap

| Phase | Improvements | Timeline | Investment |
|-------|--------------|----------|------------|
| 🟢 **Wave 1** | IMP-004 (E-Invoicing) + IMP-001 (Agentic AI Foundation) | Q1-Q2 2026 | $8-12M |
| 🟢 **Wave 2** | IMP-002 (Dynamic Discounting) + IMP-003 (Virtual Card) | Q2-Q3 2026 | $6-10M |
| 🟡 **Wave 3** | IMP-001 (Agents Full) + IMP-005 (Cash Visibility) | Q3-Q4 2026 | $8-12M |
| 🟡 **Wave 4** | IMP-006 (Payment Timing) + IMP-007 (PLG) | Q4 2026-Q1 2027 | $5-8M |
| ⚪ **Wave 5** | IMP-008 (Network) + IMP-009 (Analytics) + IMP-010 (Ecosystem) | Q1-Q2 2027 | $4-6M |

### Critical Path Dependencies

- **E-Invoicing (IMP-004)** must be Wave 1 due to Belgium/Poland mandates in Jan/Feb 2026
- **Agentic AI Foundation (IMP-001)** enables all other intelligence features
- **Payment Monetization (IMP-002/003)** generates revenue to fund later waves
- **Cash Visibility (IMP-005)** required before Payment Timing (IMP-006)
- **PLG (IMP-007)** enables Supplier Network (IMP-008)

### Success Milestones

- **Q2 2026:** E-invoicing compliance for Belgium/Poland; Agentic AI in beta
- **Q4 2026:** Touchless rate >97%; Virtual card adoption >30%; Dynamic discounting live
- **Q2 2027:** Full autonomous processing; PLG generating 1K+ SMB accounts; NRR >120%
