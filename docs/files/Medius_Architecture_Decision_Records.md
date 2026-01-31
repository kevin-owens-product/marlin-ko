# Medius Platform
## Architecture Decision Records

**Version 1.0 | January 2026**

*Strategic technical decisions for AI-native platform transformation*

---

## Executive Summary

This document captures the key architecture decisions that will guide Medius's transformation from a traditional AP automation platform to an AI-native autonomous finance platform. Each ADR follows a standard format: Context, Decision, Consequences, and Alternatives Considered.

### ADR Index

| ADR # | Decision Area | Status |
|-------|--------------|--------|
| ADR-001 | Agentic AI Architecture | ✅ Approved |
| ADR-002 | Multi-Agent Orchestration Pattern | ✅ Approved |
| ADR-003 | Payment Monetization Strategy | ✅ Approved |
| ADR-004 | E-Invoicing Compliance Architecture | ✅ Approved |
| ADR-005 | Composable Platform Design | ✅ Approved |
| ADR-006 | Product-Led Growth Infrastructure | ✅ Approved |
| ADR-007 | Treasury Adjacency Approach | ✅ Approved |
| ADR-008 | Data Network Effects Strategy | ✅ Approved |
| ADR-009 | ERP Integration Modernization | ✅ Approved |
| ADR-010 | Security & Compliance Framework | ✅ Approved |
| ADR-011 | Observability & AI Monitoring | ✅ Approved |
| ADR-012 | Build vs Buy vs Partner Framework | ✅ Approved |

---

# ADR-001: Agentic AI Architecture

**Status:** Approved  
**Date:** January 2026  
**Deciders:** CPO, CTO, VP Engineering

## Context

The competitive landscape is shifting toward autonomous AI agents. Tipalti ($8.3B valuation) announced agentic capabilities. Stampli has Billy the Bot. BILL launched AgenTeq. Medius must transition from AI-assisted to AI-autonomous to maintain market leadership.

Current AI capabilities (SmartFlow, Copilot) are point solutions. We need a unified architecture that enables:
- Specialized agents for distinct tasks
- Multi-agent collaboration on complex workflows
- Human-in-the-loop with configurable thresholds
- Continuous learning from corrections
- Full auditability for compliance

## Decision

**Adopt a specialized multi-agent architecture with the following components:**

### Agent Types

| Agent | Responsibility | Autonomy Level |
|-------|---------------|----------------|
| Capture Agent | Extract, validate, correct invoice data | High (>95% autonomous) |
| Classification Agent | GL coding, cost center assignment | High (>95% autonomous) |
| Matching Agent | PO matching, discrepancy resolution | Medium (>80% autonomous) |
| Risk Agent | Fraud detection, risk scoring | Medium (approval required) |
| Communication Agent | Supplier inquiry handling | Medium (>70% autonomous) |
| Payment Agent | Timing optimization, method selection | Low (recommendations only) |
| Compliance Agent | Regulatory validation, format checking | High (rule-based) |
| Advisory Agent | Insights, recommendations for CFOs | Low (suggestions only) |

### Architecture Principles

1. **Single Responsibility:** Each agent owns one domain
2. **Shared Memory:** Common context store for agent collaboration
3. **Explicit Handoffs:** Clear protocols for multi-agent workflows
4. **Human Override:** Every agent decision can be overridden
5. **Audit Trail:** Complete reasoning logged for every action

### Technology Stack

- **Foundation Model:** Azure OpenAI GPT-4 (existing relationship)
- **Agent Framework:** LangGraph for orchestration
- **Vector Store:** Pinecone for RAG
- **Feedback Loop:** Online learning with human corrections

## Consequences

### Positive
- Enables 99%+ touchless processing target
- Creates defensible competitive moat
- Positions Medius as innovation leader
- Leverages existing AI investments

### Negative
- Significant engineering investment ($15-20M)
- 18-24 month timeline to full deployment
- Requires new MLOps capabilities
- Customer education needed for adoption

### Risks
- AI accuracy may not meet enterprise expectations
- Regulatory uncertainty around AI in financial processes
- Talent acquisition in competitive AI market

## Alternatives Considered

| Alternative | Reason Rejected |
|------------|-----------------|
| Single monolithic AI model | Less flexible, harder to improve individual capabilities |
| No-code AI builder | Insufficient for complex finance workflows |
| Wait for market maturity | Competitive window closing |

---

# ADR-002: Multi-Agent Orchestration Pattern

**Status:** Approved  
**Date:** January 2026

## Context

With multiple specialized agents, we need a pattern for coordination. Options include:
- Centralized orchestrator
- Peer-to-peer communication
- Event-driven choreography
- Hierarchical delegation

## Decision

**Adopt hierarchical orchestration with event-driven fallback:**

```
                    ┌─────────────────┐
                    │   Orchestrator  │
                    │    (Planner)    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │ Capture │        │ Classify│        │  Match  │
    │  Agent  │        │  Agent  │        │  Agent  │
    └────┬────┘        └────┬────┘        └────┬────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Shared Memory  │
                    │  (Context Store)│
                    └─────────────────┘
```

### Orchestration Rules

1. **Sequential by default:** Capture → Classify → Match → Risk → Approve
2. **Parallel when independent:** Risk assessment runs parallel to matching
3. **Escalation on uncertainty:** Low confidence triggers human review
4. **Shared context:** All agents read/write to common memory

## Consequences

### Positive
- Clear flow control and debugging
- Easy to add new agents
- Supports complex multi-step workflows
- Maintains audit trail

### Negative
- Orchestrator is potential bottleneck
- Requires careful state management
- More complex than simple chaining

---

# ADR-003: Payment Monetization Strategy

**Status:** Approved  
**Date:** January 2026

## Context

Payment monetization represents largest revenue expansion opportunity. Current state:
- 40% early payment discount capture (vs 90% potential)
- 15% virtual card adoption (vs 40% target)
- No supply chain finance offering
- Limited dynamic discounting

Competitors (Ramp, BILL) have made payment economics central to value proposition.

## Decision

**Build integrated payment optimization layer with three revenue streams:**

### Revenue Streams

| Stream | Mechanism | Target Revenue |
|--------|-----------|----------------|
| Dynamic Discounting | Share of discount captured | $30-50 per $1M payables |
| Virtual Card Rebates | Revenue share with issuers | 0.3-0.5% of card volume |
| SCF Facilitation | Referral/platform fees | $10-20 per $1M financed |

### Implementation Approach

1. **Phase 1 (Q2 2026):** Virtual card expansion via Paymode network
2. **Phase 2 (Q3 2026):** Dynamic discounting platform
3. **Phase 3 (Q4 2026):** SCF marketplace integration

### Partner Strategy

- **Virtual Cards:** Leverage existing issuer relationships
- **SCF:** Integrate Taulia, C2FO, PrimeRevenue (not build)
- **Dynamic Discounting:** Build proprietary (competitive differentiator)

## Consequences

### Positive
- Transforms ROI conversation from cost savings to profit generation
- Creates recurring transaction revenue
- Deepens customer value and retention
- Enables competitive positioning vs Ramp/BILL

### Negative
- Requires supplier adoption (network effects take time)
- Revenue depends on customer cash availability
- Regulatory complexity in some jurisdictions

---

# ADR-004: E-Invoicing Compliance Architecture

**Status:** Approved  
**Date:** January 2026

## Context

E-invoicing mandates accelerating globally:
- Belgium: Jan 2026 (Peppol mandatory)
- Poland: Feb 2026 (KSeF mandatory)
- France: Sept 2026 (PPF mandatory)
- Germany: Jan 2027

Current Pagero dependency creates strategic risk following Thomson Reuters acquisition. Need owned compliance capability.

## Decision

**Build proprietary compliance intelligence layer with multi-partner network strategy:**

### Architecture

```
┌─────────────────────────────────────────────────────┐
│            Medius Compliance Intelligence            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Schema    │  │  Regulatory │  │   Format    │  │
│  │  Validator  │  │   Monitor   │  │ Transformer │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────┬───────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼────┐      ┌───▼────┐      ┌────▼────┐
    │ Peppol  │      │ Direct │      │ Pagero  │
    │   AP    │      │  Gov   │      │  (Long  │
    │ (Owned) │      │  APIs  │      │  Tail)  │
    └─────────┘      └────────┘      └─────────┘
```

### Key Components

1. **Schema Library:** 100+ country-specific formats
2. **Regulatory Monitor:** Automated rule updates
3. **Format Transformer:** Lossless conversion engine
4. **Peppol Access Point:** Owned certification
5. **Government APIs:** Direct PPF, KSeF, SDI integration

### Partner Strategy

- **Priority markets:** Own (Peppol AP + direct government)
- **Long tail:** Pagero + alternatives for 20% of volume
- **Reduce dependency:** Target <30% Pagero by 2027

## Consequences

### Positive
- Eliminates single-partner dependency risk
- Creates competitive moat (compliance expertise)
- Enables compliance-led sales motion
- Reduces per-transaction costs long-term

### Negative
- Significant investment ($5-8M)
- Requires regulatory expertise hires
- Peppol certification process takes 6+ months
- Ongoing maintenance burden

---

# ADR-005: Composable Platform Design

**Status:** Approved  
**Date:** January 2026

## Context

Enterprise buyers increasingly demand:
- Best-of-breed components that integrate
- APIs for custom workflows
- Flexibility to adopt incrementally
- Avoid vendor lock-in

Current architecture is monolithic, limiting composability.

## Decision

**Adopt API-first composable architecture:**

### Design Principles

1. **API-First:** Every capability exposed via versioned REST/GraphQL APIs
2. **Event-Driven:** Publish events for all state changes
3. **Headless Option:** Core logic decoupled from UI
4. **Extensibility:** Webhooks, custom fields, workflow hooks

### API Strategy

| API Category | Authentication | Rate Limits |
|--------------|----------------|-------------|
| Public APIs | OAuth 2.0 / API Key | 1000/min |
| Partner APIs | Mutual TLS | 10000/min |
| Internal APIs | Service mesh | Unlimited |

### Event Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Invoice   │────▶│   Event     │────▶│  Customer   │
│   Service   │     │    Bus      │     │  Webhooks   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼───┐   ┌───▼────┐   ┌───▼────┐
         │Analytics│   │ Audit  │   │Partner │
         │ Service │   │  Log   │   │  Apps  │
         └────────┘   └────────┘   └────────┘
```

## Consequences

### Positive
- Enables partner ecosystem
- Supports customer customization
- Facilitates gradual adoption
- Future-proofs architecture

### Negative
- Requires API governance discipline
- Versioning complexity
- Performance overhead of event publishing

---

# ADR-006: Product-Led Growth Infrastructure

**Status:** Approved  
**Date:** January 2026

## Context

Current sales-led model:
- High CAC ($50K+ for enterprise)
- Long sales cycles (6-12 months)
- Limited SMB penetration
- Missing viral growth mechanics

AI-native competitors (Ramp, Brex) winning with PLG.

## Decision

**Build self-service infrastructure for SMB acquisition:**

### Freemium Model

| Tier | Volume | Price | Target |
|------|--------|-------|--------|
| Free | 50 invoices/month | $0 | Trial, micro-business |
| Starter | 500 invoices/month | $299/month | Small business |
| Professional | 2000 invoices/month | $999/month | Mid-market |
| Enterprise | Unlimited | Custom | Large enterprise |

### Self-Service Capabilities

1. **Instant Value Demo:** Upload invoice, see extraction in <5 min
2. **Email Forwarding Setup:** Connect inbox, auto-capture
3. **Simple ERP Connect:** OAuth-based connector setup
4. **Guided Workflow Builder:** Template-based approval setup

### Growth Mechanics

```
┌─────────────────────────────────────────────────────┐
│                   Viral Loop                         │
│                                                      │
│  Buyer Signs Up ──▶ Invites Suppliers ──▶ Suppliers │
│       │                                    See Value │
│       │                                        │     │
│       │              ┌─────────────────────────┘     │
│       │              │                               │
│       │              ▼                               │
│       └─────── Suppliers Become Buyers ◀────────────┘
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Consequences

### Positive
- Reduces CAC for SMB segment
- Creates supplier network effects
- Generates enterprise leads from SMB
- Enables rapid experimentation

### Negative
- Cannibalizes some existing deals
- Support cost for free users
- Requires product simplification

---

# ADR-007: Treasury Adjacency Approach

**Status:** Approved  
**Date:** January 2026

## Context

AP is largest source of predictable cash outflows. CFOs need:
- Real-time cash visibility
- Accurate cash forecasting
- Working capital optimization

Opportunity to expand into treasury-adjacent without competing with TMS (Kyriba, etc.).

## Decision

**Build AP-anchored treasury capabilities:**

### Scope Definition

| In Scope | Out of Scope |
|----------|--------------|
| Bank balance visibility | Full TMS functionality |
| AP-based cash forecasting | AR forecasting |
| Payment timing optimization | Investment management |
| Working capital dashboards | Debt management |

### Integration Approach

- **Bank Connectivity:** Plaid, MX, Yodlee for balance/transaction feeds
- **Forecast Engine:** ML model trained on AP patterns
- **Cash Calendar:** Payment-centric view with cash impact

### Partner vs Build

- **Build:** Forecasting, dashboards, payment optimization
- **Partner:** Bank connectivity (Plaid), FX hedging (if needed)

## Consequences

### Positive
- Elevates CFO relevance
- Differentiates from AP-only competitors
- Natural upsell from AP customers
- Data advantage from AP visibility

### Negative
- Requires treasury domain expertise
- Bank connectivity maintenance burden
- Potential channel conflict with TMS vendors

---

# ADR-008: Data Network Effects Strategy

**Status:** Approved  
**Date:** January 2026

## Context

Medius processes $200B+ annual spend across 4,000+ customers. This data can create:
- Better AI models (more training data)
- Benchmarking capabilities
- Supplier intelligence
- Fraud detection patterns

Network effects could create defensible moat.

## Decision

**Build federated learning infrastructure for cross-customer intelligence:**

### Data Products

| Product | Value | Privacy Model |
|---------|-------|---------------|
| AI Model Improvement | Better predictions | Federated learning |
| Industry Benchmarks | Peer comparison | Anonymized aggregates |
| Supplier Intelligence | Payment behavior | Opt-in sharing |
| Fraud Patterns | Threat detection | Anonymized patterns |

### Privacy Architecture

```
┌─────────────────────────────────────────────────────┐
│              Federated Learning Layer                │
│                                                      │
│   Customer A    Customer B    Customer C            │
│   ┌────────┐    ┌────────┐    ┌────────┐           │
│   │ Local  │    │ Local  │    │ Local  │           │
│   │ Model  │    │ Model  │    │ Model  │           │
│   └───┬────┘    └───┬────┘    └───┬────┘           │
│       │             │             │                 │
│       └─────────────┼─────────────┘                 │
│                     ▼                               │
│            ┌────────────────┐                       │
│            │ Global Model   │                       │
│            │ (Aggregated    │                       │
│            │  Gradients)    │                       │
│            └────────────────┘                       │
└─────────────────────────────────────────────────────┘
```

### Governance

- **Opt-in by default:** Customers choose participation level
- **Anonymization:** No PII in aggregated insights
- **Data sovereignty:** Respect regional requirements
- **Transparency:** Clear explanation of data usage

## Consequences

### Positive
- Creates compounding competitive advantage
- Improves AI for all customers
- Enables premium analytics offerings
- Defensible moat over time

### Negative
- Privacy concerns require careful handling
- Federated learning complexity
- Customer trust must be earned

---

# ADR-009: ERP Integration Modernization

**Status:** Approved  
**Date:** January 2026

## Context

Current ERP integration:
- 70+ pre-built connectors
- Maintenance burden significant
- Quality varies by ERP
- Custom integrations slow to deliver

Need scalable integration architecture.

## Decision

**Adopt integration platform approach:**

### Architecture

| Layer | Technology | Purpose |
|-------|------------|---------|
| Connector Layer | Workato / Tray.io (evaluate) | Pre-built adapters |
| Transformation | Custom mapping engine | Field transformation |
| Orchestration | Event-driven sync | Real-time + batch |
| API Gateway | Kong / Apigee | Rate limiting, auth |

### ERP Prioritization

| Tier | ERPs | Investment |
|------|------|------------|
| Tier 1 | SAP S/4, D365 F&O, NetSuite | Deep native integration |
| Tier 2 | Oracle Cloud, Workday, Sage | Strong connector |
| Tier 3 | Others | Platform + custom |

### Modern Integration Patterns

- **Real-time sync** for master data changes
- **Batch sync** for high-volume transactions
- **Event-driven** for status updates
- **API-first** for customer-initiated

## Consequences

### Positive
- Reduces connector maintenance
- Faster new ERP support
- Better scalability
- Enables customer self-service

### Negative
- Platform licensing costs
- Migration complexity
- Potential vendor lock-in

---

# ADR-010: Security & Compliance Framework

**Status:** Approved  
**Date:** January 2026

## Context

Financial data requires highest security standards:
- SOC 2 Type II (current)
- SOC 1 Type II (current)
- GDPR (current)
- ISO 27001 (current)

AI introduces new considerations:
- Model security
- Prompt injection risks
- Data leakage through AI
- Audit of AI decisions

## Decision

**Extend security framework for AI-native platform:**

### AI Security Controls

| Risk | Control |
|------|---------|
| Prompt injection | Input sanitization, output filtering |
| Data leakage | PII masking in prompts, data boundaries |
| Model poisoning | Training data validation, anomaly detection |
| Unauthorized access | RBAC extends to agent capabilities |

### Compliance Additions

- **AI Audit Trail:** Complete logging of agent decisions
- **Explainability:** Every AI decision has reasoning
- **Human Override:** Documented override capability
- **Model Governance:** Version control, approval process

### Zero Trust Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Zero Trust Layers                    │
│                                                      │
│   Identity ──▶ Device ──▶ Network ──▶ Application  │
│      │           │           │            │         │
│   ┌──▼──┐    ┌──▼──┐    ┌──▼──┐     ┌───▼───┐     │
│   │ SSO │    │ MDM │    │ VPN │     │ RBAC  │     │
│   │ MFA │    │Trust│    │ FW  │     │ Data  │     │
│   └─────┘    └─────┘    └─────┘     │ Level │     │
│                                      └───────┘     │
└─────────────────────────────────────────────────────┘
```

## Consequences

### Positive
- Maintains enterprise trust
- Enables AI adoption with confidence
- Differentiates on security
- Regulatory compliance

### Negative
- Increased compliance overhead
- AI audit requirements complex
- Performance impact of logging

---

# ADR-011: Observability & AI Monitoring

**Status:** Approved  
**Date:** January 2026

## Context

AI systems require different observability than traditional software:
- Model drift detection
- Prediction quality tracking
- Agent behavior monitoring
- Cost optimization (AI inference costs)

## Decision

**Build AI-specific observability layer:**

### Metrics Framework

| Category | Metrics |
|----------|---------|
| Model Performance | Accuracy, precision, recall, F1 by agent |
| Business Impact | Touchless rate, exception rate, time savings |
| Operational | Latency, throughput, error rate |
| Cost | Tokens consumed, inference cost per invoice |

### Monitoring Stack

- **Metrics:** Prometheus + custom AI metrics
- **Logging:** Structured logs with decision context
- **Tracing:** Distributed tracing across agents
- **Alerting:** PagerDuty with AI-specific runbooks

### AI-Specific Dashboards

1. **Model Health:** Drift detection, accuracy trends
2. **Agent Performance:** Per-agent metrics, collaboration patterns
3. **Cost Analytics:** Inference costs, optimization opportunities
4. **Feedback Loop:** Correction rates, learning velocity

## Consequences

### Positive
- Early detection of model degradation
- Cost optimization visibility
- Debugging complex agent interactions
- Customer confidence through transparency

### Negative
- Observability infrastructure costs
- Alert fatigue risk
- Storage for detailed logging

---

# ADR-012: Build vs Buy vs Partner Framework

**Status:** Approved  
**Date:** January 2026

## Context

Limited engineering resources require clear build/buy/partner decisions. Framework needed for consistent evaluation.

## Decision

**Adopt strategic sourcing framework:**

### Decision Matrix

| Criteria | Build | Buy | Partner |
|----------|-------|-----|---------|
| Core differentiator? | ✅ | ❌ | ❌ |
| Competitive advantage from ownership? | ✅ | ❌ | ❌ |
| Rapidly evolving space? | ❌ | ✅ | ❌ |
| Ecosystem value creation? | ❌ | ❌ | ✅ |
| Standard commodity? | ❌ | ✅ | ❌ |

### Strategic Sourcing Map

| Capability | Decision | Rationale |
|------------|----------|-----------|
| AI Agents | Build | Core differentiator |
| Foundation Models | Buy (Azure OpenAI) | Commodity, evolving |
| E-Invoice Network | Hybrid | Own intelligence, partner network |
| Virtual Cards | Partner | Not core, leverage Paymode |
| SCF | Partner | Integrate Taulia, C2FO |
| ERP Integration | Buy platform + Build connectors | Balance scale/customization |
| Bank Connectivity | Buy (Plaid) | Commodity, maintenance burden |
| Contract Management | Partner (Ironclad) | Best-of-breed integration |
| Tax Determination | Partner (Avalara) | Specialized domain |

### Evaluation Criteria Weights

1. **Strategic Value** (40%): Does ownership create moat?
2. **Time to Market** (25%): Speed of delivery
3. **Total Cost** (20%): Build + maintain vs license
4. **Risk** (15%): Dependency, vendor viability

## Consequences

### Positive
- Consistent decision making
- Focus resources on differentiation
- Faster time to market for non-core
- Clear partner strategy

### Negative
- Partner dependencies
- Integration complexity
- Less control over experience

---

## Appendix: Implementation Timeline

| Quarter | ADR Focus |
|---------|-----------|
| Q1 2026 | ADR-004 (E-Invoicing), ADR-001 (Agentic Foundation) |
| Q2 2026 | ADR-003 (Payment Monetization), ADR-002 (Orchestration) |
| Q3 2026 | ADR-001 (Agents Full), ADR-007 (Treasury) |
| Q4 2026 | ADR-006 (PLG), ADR-005 (Composable) |
| Q1 2027 | ADR-008 (Network Effects), ADR-009 (ERP Modern) |
| Ongoing | ADR-010 (Security), ADR-011 (Observability), ADR-012 (Framework) |
