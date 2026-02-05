'use client';

import { useState } from 'react';
import styles from './developer.module.css';

const tabs = ['API Explorer', 'Webhooks & Events', 'Partner Marketplace'];

const apiKpis = [
  { label: 'API Endpoints', value: '47' },
  { label: 'API Calls / Month', value: '12.4M' },
  { label: 'API Uptime', value: '99.99%' },
  { label: 'Avg Response Time', value: '42ms' },
];

const httpMethodColors: Record<string, string> = {
  GET: '#23C343',
  POST: '#165DFF',
  PATCH: '#FF9A2E',
  DELETE: '#F76560',
};

const apiCategories = [
  {
    name: 'Invoices API',
    version: 'v3',
    endpoints: 12,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    rateLimit: '1,000 req/min',
    description: 'Full invoice lifecycle management, from capture to payment.',
  },
  {
    name: 'Purchase Orders API',
    version: 'v3',
    endpoints: 8,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    rateLimit: '1,000 req/min',
    description: 'Create, match, and manage purchase orders programmatically.',
  },
  {
    name: 'Suppliers API',
    version: 'v2',
    endpoints: 10,
    methods: ['GET', 'POST', 'PATCH'],
    rateLimit: '800 req/min',
    description: 'Supplier onboarding, profile management, and risk scoring.',
  },
  {
    name: 'Payments API',
    version: 'v3',
    endpoints: 7,
    methods: ['GET', 'POST'],
    rateLimit: '500 req/min',
    description: 'Initiate payments, track status, and manage remittance.',
  },
  {
    name: 'GL Coding API',
    version: 'v2',
    endpoints: 5,
    methods: ['GET', 'POST', 'PATCH'],
    rateLimit: '1,200 req/min',
    description: 'Chart of accounts sync and automated GL line coding.',
  },
  {
    name: 'Analytics API',
    version: 'v1',
    endpoints: 5,
    methods: ['GET'],
    rateLimit: '200 req/min',
    description: 'Spend analytics, KPI dashboards, and custom report generation.',
  },
];

const sampleResponse = `{
  "data": [
    {
      "id": "inv_8f3a2b1c",
      "number": "INV-2026-004821",
      "supplier": {
        "id": "sup_e4d91f0a",
        "name": "Acme Industrial Supply"
      },
      "amount": 12450.00,
      "currency": "USD",
      "status": "pending",
      "due_date": "2026-02-28",
      "created_at": "2026-01-15T09:32:00Z"
    },
    {
      "id": "inv_7c2e9d4f",
      "number": "INV-2026-004822",
      "supplier": {
        "id": "sup_b3a87c12",
        "name": "Global Parts Co."
      },
      "amount": 8720.50,
      "currency": "USD",
      "status": "pending",
      "due_date": "2026-03-05",
      "created_at": "2026-01-16T14:18:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 143,
    "total_pages": 15
  },
  "meta": {
    "request_id": "req_f9e8d7c6b5a4",
    "response_time_ms": 38
  }
}`;

const webhookEventDomains = [
  {
    domain: 'Invoice Events',
    events: [
      { name: 'invoice.created', description: 'Fired when a new invoice is captured or received via any channel.', frequency: '~2,400/day', payloadSize: '1.2 KB' },
      { name: 'invoice.approved', description: 'Fired when an invoice passes all approval steps in the workflow.', frequency: '~1,800/day', payloadSize: '1.4 KB' },
      { name: 'invoice.paid', description: 'Fired when payment is confirmed and remittance is generated.', frequency: '~1,200/day', payloadSize: '1.6 KB' },
      { name: 'invoice.rejected', description: 'Fired when an invoice is rejected during review or matching.', frequency: '~340/day', payloadSize: '1.3 KB' },
    ],
  },
  {
    domain: 'Payment Events',
    events: [
      { name: 'payment.initiated', description: 'Fired when a payment batch is submitted for processing.', frequency: '~600/day', payloadSize: '2.1 KB' },
      { name: 'payment.completed', description: 'Fired when the payment is confirmed by the bank or gateway.', frequency: '~580/day', payloadSize: '2.3 KB' },
      { name: 'payment.failed', description: 'Fired when a payment fails validation, funding, or delivery.', frequency: '~45/day', payloadSize: '2.0 KB' },
    ],
  },
  {
    domain: 'Supplier Events',
    events: [
      { name: 'supplier.onboarded', description: 'Fired when a supplier completes registration and verification.', frequency: '~120/day', payloadSize: '3.2 KB' },
      { name: 'supplier.updated', description: 'Fired when supplier profile or banking details are modified.', frequency: '~90/day', payloadSize: '2.8 KB' },
      { name: 'supplier.risk_flagged', description: 'Fired when a supplier is flagged by risk screening or sanctions.', frequency: '~15/day', payloadSize: '1.9 KB' },
    ],
  },
  {
    domain: 'System Events',
    events: [
      { name: 'sync.completed', description: 'Fired when an ERP sync job finishes successfully.', frequency: '~48/day', payloadSize: '0.8 KB' },
      { name: 'sync.failed', description: 'Fired when an ERP sync job encounters an error.', frequency: '~6/day', payloadSize: '1.1 KB' },
      { name: 'threshold.exceeded', description: 'Fired when a spend or volume threshold is breached.', frequency: '~22/day', payloadSize: '0.9 KB' },
    ],
  },
];

const webhookSubscriptions = [
  {
    url: 'https://erp.acmecorp.com/webhooks/medius',
    events: ['invoice.created', 'invoice.approved', 'invoice.paid'],
    status: 'Active' as const,
    successRate: 99.8,
    lastTriggered: '2 min ago',
    retryPolicy: '3x exponential',
  },
  {
    url: 'https://api.globalpay.io/callbacks/ap',
    events: ['payment.initiated', 'payment.completed', 'payment.failed'],
    status: 'Active' as const,
    successRate: 99.5,
    lastTriggered: '8 min ago',
    retryPolicy: '5x linear',
  },
  {
    url: 'https://hooks.slack.com/services/T0X/B0Y/abc123',
    events: ['invoice.rejected', 'payment.failed', 'supplier.risk_flagged'],
    status: 'Active' as const,
    successRate: 100.0,
    lastTriggered: '1 hr ago',
    retryPolicy: '3x exponential',
  },
  {
    url: 'https://analytics.internal.net/ingest/events',
    events: ['sync.completed', 'sync.failed', 'threshold.exceeded'],
    status: 'Paused' as const,
    successRate: 97.2,
    lastTriggered: '3 days ago',
    retryPolicy: '3x exponential',
  },
  {
    url: 'https://vendor-portal.supplierx.com/api/notify',
    events: ['supplier.onboarded', 'supplier.updated'],
    status: 'Failed' as const,
    successRate: 82.1,
    lastTriggered: '12 hr ago',
    retryPolicy: '5x exponential',
  },
];

const eventStream = [
  { timestamp: '2026-02-05 14:32:18', event: 'invoice.created', destination: 'erp.acmecorp.com', responseCode: 200, latency: '120ms' },
  { timestamp: '2026-02-05 14:32:14', event: 'payment.completed', destination: 'api.globalpay.io', responseCode: 200, latency: '89ms' },
  { timestamp: '2026-02-05 14:31:58', event: 'invoice.approved', destination: 'erp.acmecorp.com', responseCode: 200, latency: '134ms' },
  { timestamp: '2026-02-05 14:31:42', event: 'supplier.risk_flagged', destination: 'hooks.slack.com', responseCode: 200, latency: '210ms' },
  { timestamp: '2026-02-05 14:31:30', event: 'invoice.paid', destination: 'erp.acmecorp.com', responseCode: 200, latency: '98ms' },
  { timestamp: '2026-02-05 14:31:11', event: 'payment.failed', destination: 'api.globalpay.io', responseCode: 200, latency: '76ms' },
  { timestamp: '2026-02-05 14:30:55', event: 'sync.completed', destination: 'analytics.internal.net', responseCode: 408, latency: '5,012ms' },
  { timestamp: '2026-02-05 14:30:40', event: 'invoice.created', destination: 'erp.acmecorp.com', responseCode: 200, latency: '115ms' },
];

const featuredPartners = [
  {
    name: 'Workato',
    category: 'iPaaS',
    description: 'Enterprise automation platform with 500+ pre-built Medius recipes for end-to-end AP workflow orchestration.',
    badge: 'Premier Partner',
    badgeColor: '#165DFF',
    installs: '2,140',
    rating: 4.8,
  },
  {
    name: 'Celonis',
    category: 'Process Mining',
    description: 'Process intelligence that identifies AP optimization opportunities and bottlenecks across your invoice lifecycle.',
    badge: 'Technology Partner',
    badgeColor: '#23C343',
    installs: '1,820',
    rating: 4.7,
  },
  {
    name: 'Codat',
    category: 'Data',
    description: 'Universal API for business data, syncing customer financials from any accounting platform into Medius.',
    badge: 'Data Partner',
    badgeColor: '#FF9A2E',
    installs: '1,350',
    rating: 4.5,
  },
  {
    name: 'Avalara',
    category: 'Tax',
    description: 'Automated tax compliance for every invoice and payment, supporting 190+ countries and all US jurisdictions.',
    badge: 'Certified Partner',
    badgeColor: '#23C343',
    installs: '1,680',
    rating: 4.6,
  },
  {
    name: 'Stripe',
    category: 'Payments',
    description: 'Payment processing and virtual card issuance for dynamic discounting and supplier payment programs.',
    badge: 'Payments Partner',
    badgeColor: '#165DFF',
    installs: '980',
    rating: 4.9,
  },
  {
    name: 'Snowflake',
    category: 'Analytics',
    description: 'Data warehouse integration for advanced spend analytics, custom models, and cross-platform reporting.',
    badge: 'Analytics Partner',
    badgeColor: '#FF9A2E',
    installs: '760',
    rating: 4.4,
  },
];

const sdkCards = [
  {
    language: 'Node.js',
    installCmd: 'npm install @medius/sdk',
    snippet: `const Medius = require('@medius/sdk');
const client = new Medius({
  apiKey: process.env.MEDIUS_API_KEY,
});

const invoices = await client.invoices.list({
  status: 'pending',
  limit: 10,
});`,
    stars: '1,240',
  },
  {
    language: 'Python',
    installCmd: 'pip install medius-sdk',
    snippet: `import medius

client = medius.Client(
    api_key=os.environ["MEDIUS_API_KEY"]
)

invoices = client.invoices.list(
    status="pending",
    limit=10,
)`,
    stars: '980',
  },
  {
    language: 'Java',
    installCmd: 'mvn: com.medius:medius-java:3.2.0',
    snippet: `MediusClient client = MediusClient.builder()
    .apiKey(System.getenv("MEDIUS_API_KEY"))
    .build();

InvoiceList invoices = client.invoices()
    .list(ListParams.builder()
        .status("pending")
        .limit(10)
        .build());`,
    stars: '620',
  },
  {
    language: 'Go',
    installCmd: 'go get github.com/medius/medius-go',
    snippet: `client := medius.NewClient(
    os.Getenv("MEDIUS_API_KEY"),
)

invoices, err := client.Invoices.List(
    &medius.InvoiceListParams{
        Status: medius.String("pending"),
        Limit:  medius.Int64(10),
    },
)`,
    stars: '410',
  },
];

const marketplaceStats = [
  { label: 'Published Integrations', value: '28' },
  { label: 'Partner Apps', value: '14' },
  { label: 'Installs', value: '8,400+' },
  { label: 'Avg Rating', value: '4.6' },
];

function getStatusStyle(status: string) {
  switch (status) {
    case 'Active':
      return styles.statusActive;
    case 'Paused':
      return styles.statusPaused;
    case 'Failed':
      return styles.statusFailed;
    default:
      return '';
  }
}

function getResponseCodeStyle(code: number) {
  if (code >= 200 && code < 300) return styles.responseOk;
  if (code >= 400) return styles.responseError;
  return styles.responseWarn;
}

export default function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.pageTitle}>Developer Portal</h1>
            <p className={styles.pageSubtitle}>
              API-first architecture powering the composable finance platform. Explore endpoints, manage webhooks, and discover partner integrations.
            </p>
          </div>
          <div className={styles.headerBadge}>
            <span className={styles.pillarTag}>Pillar 4</span>
            <span className={styles.pillarLabel}>Composable Platform</span>
          </div>
        </div>
      </div>

      <div className={styles.tabBar}>
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === idx ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab 1: API Explorer */}
      {activeTab === 0 && (
        <div className={styles.tabContent}>
          <div className={styles.kpiRow}>
            {apiKpis.map((kpi) => (
              <div key={kpi.label} className={styles.kpiCard}>
                <div className={styles.kpiValue}>{kpi.value}</div>
                <div className={styles.kpiLabel}>{kpi.label}</div>
              </div>
            ))}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>API Categories</h2>
            <div className={styles.apiGrid}>
              {apiCategories.map((api) => (
                <div key={api.name} className={styles.apiCard}>
                  <div className={styles.apiCardHeader}>
                    <span className={styles.apiName}>{api.name}</span>
                    <span className={styles.versionBadge}>{api.version}</span>
                  </div>
                  <p className={styles.apiDescription}>{api.description}</p>
                  <div className={styles.apiMeta}>
                    <span className={styles.endpointCount}>{api.endpoints} endpoints</span>
                    <span className={styles.rateLimit}>{api.rateLimit}</span>
                  </div>
                  <div className={styles.methodBadges}>
                    {api.methods.map((method) => (
                      <span
                        key={method}
                        className={styles.methodBadge}
                        style={{ backgroundColor: httpMethodColors[method], color: '#fff' }}
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Live API Console</h2>
            <div className={styles.consoleLayout}>
              <div className={styles.consoleRequest}>
                <div className={styles.consoleLabel}>Request</div>
                <div className={styles.endpointRow}>
                  <span className={styles.methodBadgeLarge} style={{ backgroundColor: '#23C343' }}>GET</span>
                  <span className={styles.endpointSelector}>Invoices API</span>
                </div>
                <div className={styles.urlBar}>
                  <span className={styles.urlBase}>https://api.medius.com</span>
                  <span className={styles.urlPath}>/api/v3/invoices?status=pending&amp;limit=10</span>
                </div>
                <div className={styles.headersSection}>
                  <div className={styles.headersTitle}>Headers</div>
                  <div className={styles.headerLine}>
                    <span className={styles.headerKey}>Authorization</span>
                    <span className={styles.headerValue}>Bearer sk_live_****************************</span>
                  </div>
                  <div className={styles.headerLine}>
                    <span className={styles.headerKey}>Content-Type</span>
                    <span className={styles.headerValue}>application/json</span>
                  </div>
                  <div className={styles.headerLine}>
                    <span className={styles.headerKey}>X-Request-Id</span>
                    <span className={styles.headerValue}>req_f9e8d7c6b5a4</span>
                  </div>
                </div>
              </div>
              <div className={styles.consoleResponse}>
                <div className={styles.responseHeader}>
                  <span className={styles.consoleLabel}>Response</span>
                  <div className={styles.responseMetaRow}>
                    <span className={styles.statusBadgeOk}>200 OK</span>
                    <span className={styles.responseTime}>38ms</span>
                  </div>
                </div>
                <pre className={styles.responseBody}>{sampleResponse}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Webhooks & Events */}
      {activeTab === 1 && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Event Catalog</h2>
            <div className={styles.eventDomainGrid}>
              {webhookEventDomains.map((domain) => (
                <div key={domain.domain} className={styles.eventDomainCard}>
                  <h3 className={styles.domainTitle}>{domain.domain}</h3>
                  <div className={styles.eventList}>
                    {domain.events.map((event) => (
                      <div key={event.name} className={styles.eventItem}>
                        <div className={styles.eventNameRow}>
                          <code className={styles.eventName}>{event.name}</code>
                        </div>
                        <p className={styles.eventDescription}>{event.description}</p>
                        <div className={styles.eventMeta}>
                          <span className={styles.eventFrequency}>{event.frequency}</span>
                          <span className={styles.eventPayload}>{event.payloadSize}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Active Subscriptions</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Endpoint URL</th>
                    <th>Events</th>
                    <th>Status</th>
                    <th>Success Rate</th>
                    <th>Last Triggered</th>
                    <th>Retry Policy</th>
                  </tr>
                </thead>
                <tbody>
                  {webhookSubscriptions.map((sub, idx) => (
                    <tr key={idx}>
                      <td>
                        <code className={styles.webhookUrl}>{sub.url}</code>
                      </td>
                      <td>
                        <div className={styles.eventTags}>
                          {sub.events.map((e) => (
                            <span key={e} className={styles.eventTag}>{e}</span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusStyle(sub.status)}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        <span className={sub.successRate >= 99 ? styles.rateGood : sub.successRate >= 95 ? styles.rateWarn : styles.rateBad}>
                          {sub.successRate}%
                        </span>
                      </td>
                      <td className={styles.mutedText}>{sub.lastTriggered}</td>
                      <td className={styles.mutedText}>{sub.retryPolicy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Event Stream</h2>
            <div className={styles.streamContainer}>
              <div className={styles.streamHeader}>
                <span>Timestamp</span>
                <span>Event</span>
                <span>Destination</span>
                <span>Status</span>
                <span>Latency</span>
              </div>
              {eventStream.map((entry, idx) => (
                <div key={idx} className={styles.streamRow}>
                  <span className={styles.streamTimestamp}>{entry.timestamp}</span>
                  <code className={styles.streamEvent}>{entry.event}</code>
                  <span className={styles.streamDest}>{entry.destination}</span>
                  <span className={`${styles.streamCode} ${getResponseCodeStyle(entry.responseCode)}`}>
                    {entry.responseCode}
                  </span>
                  <span className={styles.streamLatency}>{entry.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Partner Marketplace */}
      {activeTab === 2 && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Marketplace Stats</h2>
            <div className={styles.kpiRow}>
              {marketplaceStats.map((stat) => (
                <div key={stat.label} className={styles.kpiCard}>
                  <div className={styles.kpiValue}>{stat.value}</div>
                  <div className={styles.kpiLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Featured Partners</h2>
            <div className={styles.partnerGrid}>
              {featuredPartners.map((partner) => (
                <div key={partner.name} className={styles.partnerCard}>
                  <div className={styles.partnerHeader}>
                    <div className={styles.partnerLogo}>
                      {partner.name.charAt(0)}
                    </div>
                    <div className={styles.partnerInfo}>
                      <div className={styles.partnerNameRow}>
                        <span className={styles.partnerName}>{partner.name}</span>
                        <span className={styles.partnerCategory}>{partner.category}</span>
                      </div>
                      <span
                        className={styles.partnerBadge}
                        style={{ backgroundColor: partner.badgeColor }}
                      >
                        {partner.badge}
                      </span>
                    </div>
                  </div>
                  <p className={styles.partnerDescription}>{partner.description}</p>
                  <div className={styles.partnerFooter}>
                    <span className={styles.partnerInstalls}>{partner.installs} installs</span>
                    <span className={styles.partnerRating}>
                      {'★'.repeat(Math.floor(partner.rating))}
                      {partner.rating % 1 >= 0.5 ? '½' : ''}
                      <span className={styles.ratingValue}>{partner.rating}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Build Your Own</h2>
            <p className={styles.sectionSubtitle}>Official SDKs and developer tools to integrate with the Medius platform.</p>
            <div className={styles.sdkGrid}>
              {sdkCards.map((sdk) => (
                <div key={sdk.language} className={styles.sdkCard}>
                  <div className={styles.sdkHeader}>
                    <span className={styles.sdkLanguage}>{sdk.language}</span>
                    <span className={styles.sdkStars}>
                      {'★'} {sdk.stars}
                    </span>
                  </div>
                  <div className={styles.sdkInstall}>
                    <div className={styles.sdkInstallLabel}>Install</div>
                    <pre className={styles.sdkInstallCmd}>{sdk.installCmd}</pre>
                  </div>
                  <div className={styles.sdkSnippet}>
                    <div className={styles.sdkSnippetLabel}>Quickstart</div>
                    <pre className={styles.sdkSnippetCode}>{sdk.snippet}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
