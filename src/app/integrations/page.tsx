'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './integrations.module.css';

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = ['Integration Overview', 'Connectors & Middleware', 'Integration Health'];

// ---------------------------------------------------------------------------
// Tab 1 — Integration Overview data
// ---------------------------------------------------------------------------

const overviewKPIs = [
  { label: 'ERP Systems Connected', value: '6', sub: 'Across 4 regions' },
  { label: 'Records Synced', value: '2.8M', sub: 'Last 30 days' },
  { label: 'Sync Success Rate', value: '99.7%', sub: '+0.2% vs last month' },
  { label: 'Avg Latency', value: '< 30s', sub: 'P95: 48s' },
];

const connectedSystems = [
  {
    name: 'SAP S/4HANA',
    status: 'Connected',
    direction: 'Bidirectional',
    lastSync: '2 min ago',
    records: '1,247,832',
    health: 99.8,
    sparkline: [95, 98, 99, 100, 99, 98, 100],
  },
  {
    name: 'Oracle NetSuite',
    status: 'Connected',
    direction: 'Bidirectional',
    lastSync: '5 min ago',
    records: '834,219',
    health: 99.4,
    sparkline: [92, 96, 98, 99, 97, 99, 99],
  },
  {
    name: 'Dynamics 365',
    status: 'Syncing',
    direction: 'Bidirectional',
    lastSync: 'In progress',
    records: '412,087',
    health: 98.9,
    sparkline: [88, 93, 95, 97, 96, 98, 99],
  },
  {
    name: 'Sage Intacct',
    status: 'Connected',
    direction: 'Inbound',
    lastSync: '12 min ago',
    records: '198,441',
    health: 99.1,
    sparkline: [96, 97, 99, 98, 99, 100, 99],
  },
  {
    name: 'Workday',
    status: 'Connected',
    direction: 'Outbound',
    lastSync: '8 min ago',
    records: '87,234',
    health: 99.6,
    sparkline: [98, 99, 100, 99, 100, 99, 100],
  },
  {
    name: 'QuickBooks Enterprise',
    status: 'Disconnected',
    direction: 'Inbound',
    lastSync: '3 days ago',
    records: '23,109',
    health: 72.4,
    sparkline: [90, 85, 78, 72, 68, 70, 72],
  },
];

const dataFlowNodes = {
  left: [
    { name: 'SAP S/4HANA', status: 'active' },
    { name: 'Oracle NetSuite', status: 'active' },
    { name: 'Dynamics 365', status: 'syncing' },
    { name: 'Sage Intacct', status: 'active' },
    { name: 'Workday', status: 'active' },
    { name: 'QuickBooks', status: 'error' },
  ],
  topRight: [
    { name: 'Plaid API', status: 'active' },
    { name: 'Stripe Connect', status: 'active' },
    { name: 'JP Morgan Access', status: 'active' },
  ],
  right: [
    { name: 'Supplier Portal', status: 'active' },
    { name: 'Vendor Onboarding', status: 'active' },
  ],
  bottomRight: [
    { name: 'Peppol Network', status: 'active' },
    { name: 'Ariba Network', status: 'active' },
  ],
  bottom: [
    { name: 'ML Pipeline', status: 'active' },
    { name: 'Anomaly Detection', status: 'active' },
    { name: 'NLP Engine', status: 'active' },
  ],
};

const syncActivity = [
  { timestamp: '2026-02-05 14:32:18', system: 'SAP S/4HANA', direction: 'inbound', recordType: 'Invoices', count: 342, status: 'Success', duration: '12s' },
  { timestamp: '2026-02-05 14:31:45', system: 'Oracle NetSuite', direction: 'outbound', recordType: 'Payment Status', count: 128, status: 'Success', duration: '8s' },
  { timestamp: '2026-02-05 14:30:22', system: 'Dynamics 365', direction: 'inbound', recordType: 'Purchase Orders', count: 87, status: 'In Progress', duration: '\u2014' },
  { timestamp: '2026-02-05 14:29:11', system: 'SAP S/4HANA', direction: 'bidirectional', recordType: 'GL Entries', count: 1204, status: 'Success', duration: '28s' },
  { timestamp: '2026-02-05 14:28:03', system: 'Sage Intacct', direction: 'inbound', recordType: 'Vendor Master', count: 15, status: 'Success', duration: '3s' },
  { timestamp: '2026-02-05 14:27:44', system: 'Workday', direction: 'outbound', recordType: 'Cost Center Alloc.', count: 56, status: 'Success', duration: '6s' },
  { timestamp: '2026-02-05 14:25:09', system: 'QuickBooks Enterprise', direction: 'inbound', recordType: 'Invoices', count: 0, status: 'Failed', duration: '\u2014' },
  { timestamp: '2026-02-05 14:24:18', system: 'Oracle NetSuite', direction: 'inbound', recordType: 'Supplier Invoices', count: 219, status: 'Success', duration: '15s' },
  { timestamp: '2026-02-05 14:22:41', system: 'SAP S/4HANA', direction: 'outbound', recordType: 'Approval Status', count: 93, status: 'Success', duration: '5s' },
  { timestamp: '2026-02-05 14:20:33', system: 'Dynamics 365', direction: 'inbound', recordType: 'Contracts', count: 44, status: 'Success', duration: '9s' },
];

// ---------------------------------------------------------------------------
// Tab 2 — Connectors & Middleware data
// ---------------------------------------------------------------------------

const connectorLibrary = [
  {
    tier: 'Tier 1 \u2014 Deep Native',
    badge: 'Native',
    badgeClass: 'badgeNative',
    connectors: [
      { name: 'SAP S/4HANA', dataTypes: ['Invoices', 'POs', 'Payments', 'GL Entries', 'Vendor Master'], throughput: '2,400 rec/min', status: 'active' },
      { name: 'Dynamics 365 F&O', dataTypes: ['Invoices', 'POs', 'Payments', 'GL Entries', 'Budget'], throughput: '1,800 rec/min', status: 'active' },
      { name: 'Oracle NetSuite', dataTypes: ['Invoices', 'POs', 'Payments', 'GL Entries', 'Projects'], throughput: '2,100 rec/min', status: 'active' },
    ],
  },
  {
    tier: 'Tier 2 \u2014 Strong Connector',
    badge: 'Certified',
    badgeClass: 'badgeCertified',
    connectors: [
      { name: 'Oracle Cloud ERP', dataTypes: ['Invoices', 'POs', 'Payments', 'GL Entries'], throughput: '1,200 rec/min', status: 'active' },
      { name: 'Workday Financials', dataTypes: ['Invoices', 'Expenses', 'GL Entries', 'Cost Centers'], throughput: '950 rec/min', status: 'active' },
      { name: 'Sage Intacct', dataTypes: ['Invoices', 'POs', 'Payments', 'GL Entries'], throughput: '1,050 rec/min', status: 'active' },
    ],
  },
  {
    tier: 'Tier 3 \u2014 Platform + Custom',
    badge: 'Standard',
    badgeClass: 'badgeStandard',
    connectors: [
      { name: 'QuickBooks Enterprise', dataTypes: ['Invoices', 'POs', 'Payments'], throughput: '600 rec/min', status: 'error' },
      { name: 'Xero', dataTypes: ['Invoices', 'Payments', 'Bank Feeds'], throughput: '450 rec/min', status: 'inactive' },
      { name: 'Custom REST API', dataTypes: ['Configurable'], throughput: 'Variable', status: 'active' },
    ],
  },
];

const pipelineStages = [
  { name: 'Ingest', volume: '2,847', sub: 'Raw records received', color: '#165DFF' },
  { name: 'Validate', volume: '2,831', sub: '99.4% pass rate', color: '#36BFFA' },
  { name: 'Transform', volume: '2,828', sub: 'Schema normalization', color: '#8E51DA' },
  { name: 'Map', volume: '2,824', sub: 'Field mapping applied', color: '#FF9A2E' },
  { name: 'Load', volume: '2,821', sub: '99.1% success rate', color: '#23C343' },
];

const fieldMappings = [
  { source: 'vendor_name', target: 'supplier.name', confidence: 99, autoMapped: true },
  { source: 'po_number', target: 'purchaseOrder.id', confidence: 98, autoMapped: true },
  { source: 'inv_date', target: 'invoice.date', confidence: 97, autoMapped: true },
  { source: 'gl_code', target: 'account.code', confidence: 94, autoMapped: true },
  { source: 'tax_amount', target: 'lineItem.taxTotal', confidence: 96, autoMapped: true },
  { source: 'net_amount', target: 'lineItem.netAmount', confidence: 98, autoMapped: true },
  { source: 'payment_terms', target: 'invoice.paymentTerms', confidence: 91, autoMapped: true },
  { source: 'cost_center', target: 'allocation.costCenter', confidence: 89, autoMapped: false },
  { source: 'project_id', target: 'allocation.projectCode', confidence: 85, autoMapped: false },
  { source: 'ship_to_addr', target: 'delivery.address', confidence: 82, autoMapped: false },
];

// ---------------------------------------------------------------------------
// Tab 3 — Integration Health data
// ---------------------------------------------------------------------------

const systemHealth = [
  { name: 'SAP S/4HANA', score: 99.8, uptime: '99.99%', errorRate: '0.02%', avgLatency: '18ms', sparkline: [99, 100, 99, 100, 100, 99, 100] },
  { name: 'Oracle NetSuite', score: 99.4, uptime: '99.97%', errorRate: '0.06%', avgLatency: '24ms', sparkline: [98, 99, 99, 100, 99, 99, 99] },
  { name: 'Dynamics 365', score: 98.9, uptime: '99.95%', errorRate: '0.11%', avgLatency: '32ms', sparkline: [96, 97, 99, 98, 99, 99, 99] },
  { name: 'Sage Intacct', score: 99.1, uptime: '99.96%', errorRate: '0.09%', avgLatency: '22ms', sparkline: [97, 99, 99, 99, 100, 99, 99] },
  { name: 'Workday', score: 99.6, uptime: '99.98%', errorRate: '0.04%', avgLatency: '15ms', sparkline: [99, 100, 100, 99, 100, 100, 100] },
  { name: 'QuickBooks Enterprise', score: 72.4, uptime: '94.20%', errorRate: '5.80%', avgLatency: '890ms', sparkline: [88, 82, 76, 72, 68, 70, 72] },
];

const integrationErrors = [
  { timestamp: '2026-02-05 14:25:09', system: 'QuickBooks Enterprise', errorType: 'Connection Timeout', message: 'Failed to establish connection: ETIMEDOUT after 30000ms', retries: 3, resolution: 'Escalated' },
  { timestamp: '2026-02-05 13:18:42', system: 'QuickBooks Enterprise', errorType: 'Auth Failure', message: 'OAuth token refresh failed: invalid_grant \u2014 token expired', retries: 1, resolution: 'Pending' },
  { timestamp: '2026-02-05 11:44:03', system: 'Dynamics 365', errorType: 'Rate Limited', message: 'HTTP 429: Too Many Requests \u2014 retry after 60s', retries: 2, resolution: 'Auto-resolved' },
  { timestamp: '2026-02-05 09:12:17', system: 'SAP S/4HANA', errorType: 'Schema Mismatch', message: 'Field BELNR format changed: expected CHAR(10), received CHAR(12)', retries: 0, resolution: 'Auto-resolved' },
  { timestamp: '2026-02-04 22:38:55', system: 'Oracle NetSuite', errorType: 'Data Validation', message: 'Duplicate invoice reference: INV-2026-44821 already exists in target', retries: 0, resolution: 'Auto-resolved' },
  { timestamp: '2026-02-04 18:05:31', system: 'QuickBooks Enterprise', errorType: 'Connection Timeout', message: 'Failed to establish connection: ECONNREFUSED 10.0.4.12:443', retries: 5, resolution: 'Escalated' },
  { timestamp: '2026-02-04 15:22:08', system: 'Sage Intacct', errorType: 'Data Validation', message: 'Required field vendor_class missing on 3 records \u2014 skipped batch', retries: 0, resolution: 'Auto-resolved' },
  { timestamp: '2026-02-04 12:01:44', system: 'Dynamics 365', errorType: 'Partial Failure', message: '2 of 156 records failed mapping: unrecognized GL account 9999-00', retries: 1, resolution: 'Auto-resolved' },
];

const slaMetrics = [
  { name: 'System Uptime', target: 99.9, actual: 99.97, unit: '%', status: 'met' },
  { name: 'Data Freshness', target: 5, actual: 2.3, unit: 'min', status: 'met', note: 'Target: < 5 min' },
  { name: 'Error Resolution Time', target: 60, actual: 14, unit: 'min', status: 'met', note: 'Target: < 60 min' },
  { name: 'Sync Success Rate', target: 99.5, actual: 99.7, unit: '%', status: 'met' },
  { name: 'API Response Time', target: 200, actual: 142, unit: 'ms', status: 'met', note: 'P95 target: < 200ms' },
  { name: 'Data Accuracy', target: 99.9, actual: 99.94, unit: '%', status: 'met' },
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    Connected: styles.statusConnected,
    Syncing: styles.statusSyncing,
    Disconnected: styles.statusDisconnected,
    active: styles.statusConnected,
    syncing: styles.statusSyncing,
    error: styles.statusDisconnected,
    inactive: styles.statusInactive,
  };
  return map[status] || '';
}

function getStatusDot(status: string): string {
  const map: Record<string, string> = {
    active: styles.dotActive,
    syncing: styles.dotSyncing,
    error: styles.dotError,
    inactive: styles.dotInactive,
    Connected: styles.dotActive,
    Syncing: styles.dotSyncing,
    Disconnected: styles.dotError,
  };
  return map[status] || styles.dotInactive;
}

function getDirectionArrow(direction: string): string {
  const map: Record<string, string> = {
    inbound: '\u2190',
    outbound: '\u2192',
    bidirectional: '\u2194',
    Bidirectional: '\u2194',
    Inbound: '\u2190',
    Outbound: '\u2192',
  };
  return map[direction] || '\u2194';
}

function getHealthColor(health: number): string {
  if (health >= 98) return '#23C343';
  if (health >= 90) return '#FF9A2E';
  return '#F76560';
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 95) return '#23C343';
  if (confidence >= 90) return '#FF9A2E';
  return '#F76560';
}

function getResolutionClass(resolution: string): string {
  const map: Record<string, string> = {
    'Auto-resolved': styles.resolutionResolved,
    Escalated: styles.resolutionEscalated,
    Pending: styles.resolutionPending,
  };
  return map[resolution] || '';
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function IntegrationsPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Integrations Hub</h1>
          <p className={styles.subtitle}>
            Composable Platform &mdash; The connective tissue of your finance operations
          </p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn}>View API Docs</button>
          <button className={styles.primaryBtn}>+ Add Connector</button>
        </div>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* TAB 1 — Integration Overview                                     */}
      {/* ================================================================ */}
      {activeTab === 0 && (
        <div className={styles.tabContent}>
          {/* KPI row */}
          <div className={styles.kpiGrid}>
            {overviewKPIs.map((kpi) => (
              <div key={kpi.label} className={styles.kpiCard}>
                <div className={styles.kpiLabel}>{kpi.label}</div>
                <div className={styles.kpiValue}>{kpi.value}</div>
                <div className={styles.kpiSub}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Connected Systems */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Connected Systems</h2>
            <div className={styles.systemGrid}>
              {connectedSystems.map((sys) => (
                <div key={sys.name} className={styles.systemCard}>
                  <div className={styles.systemHeader}>
                    <div className={styles.systemNameRow}>
                      <span className={`${styles.statusDot} ${getStatusDot(sys.status)}`} />
                      <span className={styles.systemName}>{sys.name}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${getStatusClass(sys.status)}`}>
                      {sys.status}
                    </span>
                  </div>
                  <div className={styles.systemMeta}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Direction</span>
                      <span className={styles.metaValue}>
                        <span className={styles.directionArrow}>{getDirectionArrow(sys.direction)}</span>
                        {' '}{sys.direction}
                      </span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Last Sync</span>
                      <span className={styles.metaValue}>{sys.lastSync}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.metaLabel}>Records Synced</span>
                      <span className={styles.metaValue}>{sys.records}</span>
                    </div>
                  </div>
                  <div className={styles.healthRow}>
                    <span className={styles.healthLabel}>Sync Health</span>
                    <span className={styles.healthPct} style={{ color: getHealthColor(sys.health) }}>
                      {sys.health}%
                    </span>
                  </div>
                  <div className={styles.healthBarTrack}>
                    <div
                      className={styles.healthBarFill}
                      style={{ width: `${sys.health}%`, background: getHealthColor(sys.health) }}
                    />
                  </div>
                  <div className={styles.sparkline}>
                    {sys.sparkline.map((val, i) => (
                      <div
                        key={i}
                        className={styles.sparkBar}
                        style={{
                          height: `${val * 0.28}px`,
                          background: getHealthColor(val),
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Flow Map */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Data Flow Map</h2>
            <div className={styles.flowMap}>
              {/* Left column — ERPs */}
              <div className={styles.flowColumn}>
                <div className={styles.flowGroupLabel}>ERP Systems</div>
                {dataFlowNodes.left.map((node) => (
                  <div key={node.name} className={styles.flowNode}>
                    <span className={`${styles.flowDot} ${getStatusDot(node.status)}`} />
                    <span className={styles.flowNodeName}>{node.name}</span>
                  </div>
                ))}
              </div>

              {/* Connection lines left */}
              <div className={styles.flowLines}>
                <div className={styles.flowLineBundle} />
              </div>

              {/* Center hub */}
              <div className={styles.flowHub}>
                <div className={styles.flowHubInner}>
                  <div className={styles.flowHubPulse} />
                  <div className={styles.flowHubLabel}>Medius Platform</div>
                  <div className={styles.flowHubSub}>Unified Data Layer</div>
                </div>
              </div>

              {/* Connection lines right */}
              <div className={styles.flowLines}>
                <div className={styles.flowLineBundle} />
              </div>

              {/* Right column — Other systems */}
              <div className={styles.flowColumn}>
                <div className={styles.flowGroupLabel}>Bank APIs</div>
                {dataFlowNodes.topRight.map((node) => (
                  <div key={node.name} className={styles.flowNode}>
                    <span className={`${styles.flowDot} ${getStatusDot(node.status)}`} />
                    <span className={styles.flowNodeName}>{node.name}</span>
                  </div>
                ))}
                <div className={styles.flowGroupLabel} style={{ marginTop: '0.75rem' }}>Supplier Portal</div>
                {dataFlowNodes.right.map((node) => (
                  <div key={node.name} className={styles.flowNode}>
                    <span className={`${styles.flowDot} ${getStatusDot(node.status)}`} />
                    <span className={styles.flowNodeName}>{node.name}</span>
                  </div>
                ))}
                <div className={styles.flowGroupLabel} style={{ marginTop: '0.75rem' }}>E-Invoicing</div>
                {dataFlowNodes.bottomRight.map((node) => (
                  <div key={node.name} className={styles.flowNode}>
                    <span className={`${styles.flowDot} ${getStatusDot(node.status)}`} />
                    <span className={styles.flowNodeName}>{node.name}</span>
                  </div>
                ))}
                <div className={styles.flowGroupLabel} style={{ marginTop: '0.75rem' }}>AI / ML Engine</div>
                {dataFlowNodes.bottom.map((node) => (
                  <div key={node.name} className={styles.flowNode}>
                    <span className={`${styles.flowDot} ${getStatusDot(node.status)}`} />
                    <span className={styles.flowNodeName}>{node.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-Time Sync Activity */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Real-Time Sync Activity</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>System</th>
                    <th>Direction</th>
                    <th>Record Type</th>
                    <th>Count</th>
                    <th>Status</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {syncActivity.map((row, i) => (
                    <tr key={i}>
                      <td className={styles.mono}>{row.timestamp}</td>
                      <td>{row.system}</td>
                      <td>
                        <span className={styles.directionCell}>
                          <span className={styles.directionArrow}>{getDirectionArrow(row.direction)}</span>
                          <span className={styles.directionLabel}>{row.direction}</span>
                        </span>
                      </td>
                      <td>{row.recordType}</td>
                      <td className={styles.mono}>{row.count.toLocaleString()}</td>
                      <td>
                        <span className={`${styles.syncStatus} ${
                          row.status === 'Success' ? styles.syncSuccess :
                          row.status === 'In Progress' ? styles.syncProgress :
                          styles.syncFailed
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className={styles.mono}>{row.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2 — Connectors & Middleware                                   */}
      {/* ================================================================ */}
      {activeTab === 1 && (
        <div className={styles.tabContent}>
          {/* Connector Library */}
          {connectorLibrary.map((tierGroup) => (
            <div key={tierGroup.tier} className={styles.section}>
              <div className={styles.tierHeader}>
                <h2 className={styles.sectionTitle}>{tierGroup.tier}</h2>
                <span className={`${styles.tierBadge} ${styles[tierGroup.badgeClass]}`}>
                  {tierGroup.badge}
                </span>
              </div>
              <div className={styles.connectorGrid}>
                {tierGroup.connectors.map((conn) => (
                  <div key={conn.name} className={styles.connectorCard}>
                    <div className={styles.connectorHeader}>
                      <div className={styles.connectorNameRow}>
                        <span className={`${styles.statusDot} ${getStatusDot(conn.status)}`} />
                        <span className={styles.connectorName}>{conn.name}</span>
                      </div>
                      <span className={`${styles.tierBadgeSmall} ${styles[tierGroup.badgeClass]}`}>
                        {tierGroup.badge}
                      </span>
                    </div>
                    <div className={styles.connectorDataTypes}>
                      {conn.dataTypes.map((dt) => (
                        <span key={dt} className={styles.dataTypeTag}>{dt}</span>
                      ))}
                    </div>
                    <div className={styles.connectorFooter}>
                      <div className={styles.throughput}>
                        <span className={styles.throughputLabel}>Throughput</span>
                        <span className={styles.throughputValue}>{conn.throughput}</span>
                      </div>
                      <span className={`${styles.connectorStatus} ${getStatusClass(conn.status === 'active' ? 'Connected' : conn.status === 'error' ? 'Disconnected' : 'Disconnected')}`}>
                        {conn.status === 'active' ? 'Active' : conn.status === 'error' ? 'Error' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Middleware Orchestration */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Middleware Orchestration</h2>
            <p className={styles.sectionSub}>Transformation pipeline &mdash; real-time record processing flow</p>
            <div className={styles.pipeline}>
              {pipelineStages.map((stage, i) => (
                <div key={stage.name} className={styles.pipelineStage}>
                  <div className={styles.stageCard} style={{ borderTop: `3px solid ${stage.color}` }}>
                    <div className={styles.stageNumber}>{i + 1}</div>
                    <div className={styles.stageName}>{stage.name}</div>
                    <div className={styles.stageVolume}>{stage.volume}</div>
                    <div className={styles.stageSub}>{stage.sub}</div>
                  </div>
                  {i < pipelineStages.length - 1 && (
                    <div className={styles.pipelineArrow}>{'\u2192'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Field Mapping Intelligence */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Field Mapping Intelligence</h2>
            <p className={styles.sectionSub}>AI-powered automatic field mapping with confidence scores</p>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Source Field</th>
                    <th></th>
                    <th>Target Field</th>
                    <th>AI Confidence</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldMappings.map((fm) => (
                    <tr key={fm.source}>
                      <td><code className={styles.fieldCode}>{fm.source}</code></td>
                      <td className={styles.mappingArrow}>{'\u2192'}</td>
                      <td><code className={styles.fieldCode}>{fm.target}</code></td>
                      <td>
                        <div className={styles.confidenceCell}>
                          <div className={styles.confidenceBarTrack}>
                            <div
                              className={styles.confidenceBarFill}
                              style={{
                                width: `${fm.confidence}%`,
                                background: getConfidenceColor(fm.confidence),
                              }}
                            />
                          </div>
                          <span className={styles.confidenceValue} style={{ color: getConfidenceColor(fm.confidence) }}>
                            {fm.confidence}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.mappingStatus} ${fm.autoMapped ? styles.mappingAuto : styles.mappingManual}`}>
                          {fm.autoMapped ? 'Auto-mapped' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3 — Integration Health                                       */}
      {/* ================================================================ */}
      {activeTab === 2 && (
        <div className={styles.tabContent}>
          {/* System Health Dashboard */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>System Health Dashboard</h2>
            <div className={styles.healthGrid}>
              {systemHealth.map((sys) => (
                <div key={sys.name} className={styles.healthCard}>
                  <div className={styles.healthCardHeader}>
                    <span className={styles.healthCardName}>{sys.name}</span>
                    <span
                      className={styles.healthScore}
                      style={{ color: getHealthColor(sys.score) }}
                    >
                      {sys.score}%
                    </span>
                  </div>
                  <div className={styles.healthBarTrack}>
                    <div
                      className={styles.healthBarFill}
                      style={{ width: `${sys.score}%`, background: getHealthColor(sys.score) }}
                    />
                  </div>
                  <div className={styles.healthMetrics}>
                    <div className={styles.healthMetric}>
                      <span className={styles.healthMetricLabel}>Uptime</span>
                      <span className={styles.healthMetricValue}>{sys.uptime}</span>
                    </div>
                    <div className={styles.healthMetric}>
                      <span className={styles.healthMetricLabel}>Error Rate</span>
                      <span className={styles.healthMetricValue} style={{ color: parseFloat(sys.errorRate) > 1 ? '#F76560' : '#1D2129' }}>
                        {sys.errorRate}
                      </span>
                    </div>
                    <div className={styles.healthMetric}>
                      <span className={styles.healthMetricLabel}>Avg Latency</span>
                      <span className={styles.healthMetricValue}>{sys.avgLatency}</span>
                    </div>
                  </div>
                  <div className={styles.sparklineRow}>
                    <span className={styles.sparklineLabel}>Last 7 days</span>
                    <div className={styles.sparkline}>
                      {sys.sparkline.map((val, i) => (
                        <div
                          key={i}
                          className={styles.sparkBar}
                          style={{
                            height: `${val * 0.24}px`,
                            background: getHealthColor(val),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error & Retry Monitor */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Error &amp; Retry Monitor</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>System</th>
                    <th>Error Type</th>
                    <th>Message</th>
                    <th>Retries</th>
                    <th>Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {integrationErrors.map((err, i) => (
                    <tr key={i}>
                      <td className={styles.mono}>{err.timestamp}</td>
                      <td>{err.system}</td>
                      <td>
                        <span className={styles.errorTypeTag}>{err.errorType}</span>
                      </td>
                      <td className={styles.errorMessage}>{err.message}</td>
                      <td className={styles.mono}>{err.retries}</td>
                      <td>
                        <span className={`${styles.resolutionBadge} ${getResolutionClass(err.resolution)}`}>
                          {err.resolution}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SLA Compliance */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>SLA Compliance</h2>
            <div className={styles.slaGrid}>
              {slaMetrics.map((sla) => {
                const pct = sla.unit === '%'
                  ? sla.actual
                  : Math.max(0, Math.min(100, ((sla.target - sla.actual) / sla.target) * 100 + 50));
                const isMet = sla.status === 'met';

                return (
                  <div key={sla.name} className={styles.slaCard}>
                    <div className={styles.slaHeader}>
                      <span className={styles.slaName}>{sla.name}</span>
                      <span className={`${styles.slaBadge} ${isMet ? styles.slaMet : styles.slaBreached}`}>
                        {isMet ? 'SLA Met' : 'Breached'}
                      </span>
                    </div>
                    <div className={styles.slaValues}>
                      <div className={styles.slaActual}>
                        <span className={styles.slaActualValue}>
                          {sla.actual}{sla.unit === '%' ? '%' : ` ${sla.unit}`}
                        </span>
                        <span className={styles.slaActualLabel}>Actual</span>
                      </div>
                      <div className={styles.slaTarget}>
                        <span className={styles.slaTargetValue}>
                          {sla.unit === 'min' || sla.unit === 'ms' ? '< ' : ''}{sla.target}{sla.unit === '%' ? '%' : ` ${sla.unit}`}
                        </span>
                        <span className={styles.slaTargetLabel}>Target</span>
                      </div>
                    </div>
                    <div className={styles.slaBarTrack}>
                      <div
                        className={styles.slaBarTarget}
                        style={{ left: `${sla.unit === '%' ? sla.target : 50}%` }}
                      />
                      <div
                        className={styles.slaBarFill}
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background: isMet ? '#23C343' : '#F76560',
                        }}
                      />
                    </div>
                    {sla.note && <div className={styles.slaNote}>{sla.note}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
