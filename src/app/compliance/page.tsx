'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import styles from './compliance.module.css';

/* ──────────────────────────────────────────────
   MOCK DATA — inline per project conventions
   ────────────────────────────────────────────── */

const stats = [
  { icon: '\uD83C\uDF0D', label: 'Countries Active', value: '14', change: '+2 this quarter' },
  { icon: '\uD83D\uDCDC', label: 'Mandates Tracked', value: '23', change: '+3 new regulations' },
  { icon: '\u26A0\uFE0F', label: 'Validation Errors', value: '89', change: '-12 vs last week' },
  { icon: '\u2705', label: 'Network Uptime', value: '99.97%', change: 'Last 30 days' },
];

const mandates = [
  {
    flag: '\uD83C\uDDE7\uD83C\uDDEA', country: 'Belgium', system: 'B2B E-Invoicing Mandate',
    deadline: 'Jan 2026', status: 'live' as const, statusLabel: 'LIVE', readiness: 100,
    color: '#23C343', requirements: ['Peppol BIS 3.0', 'UBL 2.1 Format', 'Mandatory B2B Exchange'],
  },
  {
    flag: '\uD83C\uDDF5\uD83C\uDDF1', country: 'Poland', system: 'KSeF (Krajowy System e-Faktur)',
    deadline: 'Feb 2026', status: 'ready' as const, statusLabel: 'READY', readiness: 95,
    color: '#23C343', requirements: ['KSeF XML Schema', 'Token Authentication', 'Real-time Reporting'],
  },
  {
    flag: '\uD83C\uDDEB\uD83C\uDDF7', country: 'France', system: 'PPF (Portail Public de Facturation)',
    deadline: 'Sep 2026', status: 'progress' as const, statusLabel: 'IN PROGRESS', readiness: 65,
    color: '#FF9A2E', requirements: ['Factur-X / CII Format', 'PPF Platform Registration', 'PDP Certification'],
  },
  {
    flag: '\uD83C\uDDE9\uD83C\uDDEA', country: 'Germany', system: 'XRechnung / Peppol',
    deadline: 'Jan 2027', status: 'planning' as const, statusLabel: 'PLANNING', readiness: 40,
    color: '#165DFF', requirements: ['XRechnung 3.0 Schema', 'Peppol Network Access', 'EN16931 Compliance'],
  },
  {
    flag: '\uD83C\uDDEA\uD83C\uDDFA', country: 'EU', system: 'ViDA (VAT in the Digital Age)',
    deadline: 'Jul 2030', status: 'monitoring' as const, statusLabel: 'MONITORING', readiness: 10,
    color: '#86909C', requirements: ['Digital Reporting Requirements', 'Cross-border E-Invoicing', 'Real-time VAT Reporting'],
  },
];

const validationResults = [
  { id: 'INV-2026-9847', format: 'UBL 2.1', country: '\uD83C\uDDE7\uD83C\uDDEA BE', checkType: 'Schema', result: 'pass' as const, details: 'All 47 schema rules passed', timestamp: '2026-01-30 14:32:01' },
  { id: 'INV-2026-9846', format: 'Peppol BIS 3.0', country: '\uD83C\uDDF3\uD83C\uDDF1 NL', checkType: 'Business Rules', result: 'pass' as const, details: 'EN16931 rules validated', timestamp: '2026-01-30 14:31:45' },
  { id: 'INV-2026-9845', format: 'Factur-X', country: '\uD83C\uDDEB\uD83C\uDDF7 FR', checkType: 'Format', result: 'warning' as const, details: 'PDF/A-3 embed - minor metadata issue', timestamp: '2026-01-30 14:31:22' },
  { id: 'INV-2026-9844', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Schema', result: 'pass' as const, details: 'SDI validation successful', timestamp: '2026-01-30 14:30:58' },
  { id: 'INV-2026-9843', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Signature', result: 'fail' as const, details: 'Token auth expired - renewal required', timestamp: '2026-01-30 14:30:33' },
  { id: 'INV-2026-9842', format: 'UBL 2.1', country: '\uD83C\uDDE7\uD83C\uDDEA BE', checkType: 'Business Rules', result: 'warning' as const, details: 'Optional field BT-29 recommended', timestamp: '2026-01-30 14:29:47' },
  { id: 'INV-2026-9841', format: 'Peppol BIS 3.0', country: '\uD83C\uDDE9\uD83C\uDDEA DE', checkType: 'Schema', result: 'pass' as const, details: 'XRechnung rules validated', timestamp: '2026-01-30 14:29:15' },
  { id: 'INV-2026-9840', format: 'Factur-X', country: '\uD83C\uDDEB\uD83C\uDDF7 FR', checkType: 'Format', result: 'pass' as const, details: 'CII cross-industry invoice OK', timestamp: '2026-01-30 14:28:44' },
  { id: 'INV-2026-9839', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Signature', result: 'pass' as const, details: 'XAdES-BES signature valid', timestamp: '2026-01-30 14:28:02' },
  { id: 'INV-2026-9838', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Business Rules', result: 'pass' as const, details: 'Polish fiscal rules passed', timestamp: '2026-01-30 14:27:31' },
  { id: 'INV-2026-9837', format: 'UBL 2.1', country: '\uD83C\uDDEA\uD83C\uDDF8 ES', checkType: 'Schema', result: 'pass' as const, details: 'SII schema validated', timestamp: '2026-01-30 14:26:55' },
  { id: 'INV-2026-9836', format: 'Peppol BIS 3.0', country: '\uD83C\uDDF3\uD83C\uDDF4 NO', checkType: 'Business Rules', result: 'pass' as const, details: 'EHF 3.0 rules passed', timestamp: '2026-01-30 14:26:12' },
  { id: 'INV-2026-9835', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Format', result: 'fail' as const, details: 'Missing CodiceDestinatario field', timestamp: '2026-01-30 14:25:38' },
  { id: 'INV-2026-9834', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Schema', result: 'pass' as const, details: 'FA(2) schema v2.0 validated', timestamp: '2026-01-30 14:25:01' },
  { id: 'INV-2026-9833', format: 'Factur-X', country: '\uD83C\uDDEB\uD83C\uDDF7 FR', checkType: 'Signature', result: 'pass' as const, details: 'PAdES signature embedded', timestamp: '2026-01-30 14:24:22' },
  { id: 'INV-2026-9832', format: 'UBL 2.1', country: '\uD83C\uDDE7\uD83C\uDDEA BE', checkType: 'Schema', result: 'pass' as const, details: 'Peppol BIS 3.0 conformant', timestamp: '2026-01-30 14:23:48' },
  { id: 'INV-2026-9831', format: 'Peppol BIS 3.0', country: '\uD83C\uDDEB\uD83C\uDDEE FI', checkType: 'Business Rules', result: 'warning' as const, details: 'Finvoice mapping advisory', timestamp: '2026-01-30 14:23:05' },
  { id: 'INV-2026-9830', format: 'FatturaPA 1.2', country: '\uD83C\uDDEE\uD83C\uDDF9 IT', checkType: 'Schema', result: 'pass' as const, details: 'Tipo documento TD01 valid', timestamp: '2026-01-30 14:22:29' },
  { id: 'INV-2026-9829', format: 'KSeF XML', country: '\uD83C\uDDF5\uD83C\uDDF1 PL', checkType: 'Format', result: 'fail' as const, details: 'Encoding error - UTF-8 BOM detected', timestamp: '2026-01-30 14:21:44' },
  { id: 'INV-2026-9828', format: 'UBL 2.1', country: '\uD83C\uDDE9\uD83C\uDDEA DE', checkType: 'Business Rules', result: 'pass' as const, details: 'Leitweg-ID format validated', timestamp: '2026-01-30 14:21:02' },
];

const networkStatus = [
  { name: 'Peppol', type: 'Access Point - Owned', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 847, uptime: '99.99%', color: '#165DFF', icon: 'PEP' },
  { name: 'KSeF', type: 'Direct API', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 342, uptime: '99.95%', color: '#8E51DA', icon: 'KSF' },
  { name: 'PPF', type: 'Sandbox', status: 'testing' as const, statusLabel: 'Testing', messagesToday: 12, uptime: 'N/A', color: '#FF9A2E', icon: 'PPF' },
  { name: 'SDI', type: 'Direct API', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 892, uptime: '99.98%', color: '#23C343', icon: 'SDI' },
  { name: 'SII', type: 'Direct API', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 567, uptime: '99.97%', color: '#F76560', icon: 'SII' },
  { name: 'Pagero', type: 'Partner - Long Tail', status: 'connected' as const, statusLabel: 'Connected', messagesToday: 234, uptime: '99.90%', color: '#14C9C9', icon: 'PAG' },
];

const formatMatrix = {
  formats: ['UBL 2.1', 'Peppol BIS 3.0', 'Factur-X / CII', 'FatturaPA 1.2', 'KSeF XML'],
  conversions: [
    ['self', 'full', 'full', 'full', 'partial'],
    ['full', 'self', 'full', 'full', 'partial'],
    ['full', 'full', 'self', 'partial', 'partial'],
    ['full', 'full', 'partial', 'self', 'partial'],
    ['partial', 'partial', 'partial', 'partial', 'self'],
  ] as ('self' | 'full' | 'partial')[][],
};

const errorBreakdown = [
  { label: 'Schema Violations', count: 34, color: '#F76560' },
  { label: 'Missing Fields', count: 23, color: '#FF9A2E' },
  { label: 'Format Errors', count: 18, color: '#8E51DA' },
  { label: 'Business Rule Violations', count: 9, color: '#165DFF' },
  { label: 'Digital Signature Issues', count: 5, color: '#14C9C9' },
];

const maxErrorCount = 34;

const alerts = [
  { severity: 'critical' as const, title: 'KSeF Token Expired', description: 'Authentication token expired for Polish subsidiary PL-SUB-004. 12 invoices are blocked pending re-authentication.', time: '15 min ago', action: 'Renew Token' },
  { severity: 'critical' as const, title: 'SDI Rejection Spike', description: 'FatturaPA rejection rate increased to 4.2% (threshold: 2%). Missing CodiceDestinatario in 8 invoices.', time: '42 min ago', action: 'View Errors' },
  { severity: 'warning' as const, title: 'Belgium Schema Update', description: 'B2B mandate schema v3.2 update detected from Belgian authorities. Testing against current templates required before Feb 15.', time: '2 hours ago', action: 'Start Testing' },
  { severity: 'warning' as const, title: 'PPF Certificate Expiry', description: 'France PPF sandbox certificate expiring in 14 days. Production certificate must be renewed before Go-Live.', time: '5 hours ago', action: 'Renew Cert' },
  { severity: 'warning' as const, title: 'Peppol SMP Record', description: 'Service Metadata Publisher record for participant ID 0208:BE0123456789 needs refresh. Last updated 89 days ago.', time: '8 hours ago', action: 'Update SMP' },
  { severity: 'info' as const, title: 'Italy SDI Report Ready', description: 'Quarterly compliance report for SDI operations (Q4 2025) is ready for review and submission to Agenzia delle Entrate.', time: '1 day ago', action: 'View Report' },
  { severity: 'info' as const, title: 'Peppol Directory Update', description: 'New participant directory update available (v2026.01). Contains 847 new endpoints across 12 countries.', time: '2 days ago', action: 'Apply Update' },
  { severity: 'info' as const, title: 'ViDA Draft Published', description: 'EU Commission published updated ViDA directive draft. New timeline suggests phased rollout starting July 2030.', time: '3 days ago', action: 'Read Summary' },
];

const signatures = [
  { name: 'XAdES-BES (Peppol)', algorithm: 'RSA-SHA256', validDocs: 12847, expiry: 'Mar 2027', status: 'valid' as const },
  { name: 'CAdES-BES (KSeF)', algorithm: 'RSA-SHA256', validDocs: 3409, expiry: 'Jun 2026', status: 'renewal' as const },
  { name: 'PAdES (Factur-X)', algorithm: 'ECDSA-P256', validDocs: 1823, expiry: 'Nov 2027', status: 'valid' as const },
  { name: 'XAdES-T (SDI)', algorithm: 'RSA-SHA256', validDocs: 8932, expiry: 'Sep 2026', status: 'valid' as const },
  { name: 'XMLDSig (SII)', algorithm: 'RSA-SHA256', validDocs: 5617, expiry: 'Dec 2026', status: 'valid' as const },
];

/* ── New mock data ── */

const jurisdictionScores = [
  { country: 'Belgium', flag: '\uD83C\uDDE7\uD83C\uDDEA', score: 99.2, invoices: 2847, color: '#23C343' },
  { country: 'Poland', flag: '\uD83C\uDDF5\uD83C\uDDF1', score: 97.8, invoices: 3409, color: '#165DFF' },
  { country: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7', score: 94.1, invoices: 1823, color: '#FF9A2E' },
  { country: 'Italy', flag: '\uD83C\uDDEE\uD83C\uDDF9', score: 98.5, invoices: 2932, color: '#8E51DA' },
  { country: 'Germany', flag: '\uD83C\uDDE9\uD83C\uDDEA', score: 96.3, invoices: 1330, color: '#14C9C9' },
];

const validationTrend = [
  { day: 'Mon', total: 1847, passed: 1802, failed: 12, warnings: 33 },
  { day: 'Tue', total: 1923, passed: 1889, failed: 8, warnings: 26 },
  { day: 'Wed', total: 2104, passed: 2058, failed: 15, warnings: 31 },
  { day: 'Thu', total: 1756, passed: 1718, failed: 10, warnings: 28 },
  { day: 'Fri', total: 2231, passed: 2190, failed: 14, warnings: 27 },
  { day: 'Sat', total: 987, passed: 972, failed: 3, warnings: 12 },
  { day: 'Sun', total: 643, passed: 634, failed: 2, warnings: 7 },
];

const auditTrail = [
  { timestamp: '2026-01-30 14:45:00', event: 'Schema Updated', detail: 'Belgium B2B schema v3.2 deployed', user: 'System', type: 'config' as const },
  { timestamp: '2026-01-30 13:22:00', event: 'Certificate Renewed', detail: 'KSeF CAdES-BES renewed until Jun 2027', user: 'Admin', type: 'security' as const },
  { timestamp: '2026-01-30 11:05:00', event: 'Validation Rule Added', detail: 'New BT-29 warning rule for Belgian invoices', user: 'ComplianceBot', type: 'validation' as const },
  { timestamp: '2026-01-29 16:30:00', event: 'Network Reconnected', detail: 'PPF sandbox re-established after timeout', user: 'System', type: 'config' as const },
  { timestamp: '2026-01-29 09:15:00', event: 'Mandate Alert', detail: 'KSeF go-live date confirmed: Feb 1, 2026', user: 'System', type: 'regulatory' as const },
  { timestamp: '2026-01-28 14:00:00', event: 'Signature Verified', detail: 'Quarterly XAdES-BES audit completed', user: 'Auditor', type: 'security' as const },
  { timestamp: '2026-01-28 10:22:00', event: 'Format Mapping Updated', detail: 'Factur-X to FatturaPA partial mapping improved', user: 'DevOps', type: 'config' as const },
  { timestamp: '2026-01-27 15:45:00', event: 'Error Threshold Breached', detail: 'SDI rejection rate exceeded 2% threshold', user: 'System', type: 'validation' as const },
  { timestamp: '2026-01-27 08:30:00', event: 'Regulation Published', detail: 'EU ViDA directive draft v2 published', user: 'System', type: 'regulatory' as const },
  { timestamp: '2026-01-26 11:10:00', event: 'Peppol SMP Refresh', detail: 'SMP record updated for BE0123456789', user: 'Admin', type: 'config' as const },
];

const regulatoryCalendar = [
  { date: '2026-02-01', country: 'Poland', flag: '\uD83C\uDDF5\uD83C\uDDF1', event: 'KSeF Go-Live', severity: 'critical' as const },
  { date: '2026-02-15', country: 'Belgium', flag: '\uD83C\uDDE7\uD83C\uDDEA', event: 'Schema v3.2 Deadline', severity: 'warning' as const },
  { date: '2026-03-01', country: 'Italy', flag: '\uD83C\uDDEE\uD83C\uDDF9', event: 'SDI Q1 Report Due', severity: 'info' as const },
  { date: '2026-04-15', country: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7', event: 'PPF Pilot Phase 2', severity: 'warning' as const },
  { date: '2026-09-01', country: 'France', flag: '\uD83C\uDDEB\uD83C\uDDF7', event: 'PPF Go-Live (Large Enterprises)', severity: 'critical' as const },
  { date: '2026-09-30', country: 'Italy', flag: '\uD83C\uDDEE\uD83C\uDDF9', event: 'SDI Q3 Report Due', severity: 'info' as const },
  { date: '2027-01-01', country: 'Germany', flag: '\uD83C\uDDE9\uD83C\uDDEA', event: 'XRechnung Mandate Start', severity: 'critical' as const },
  { date: '2030-07-01', country: 'EU', flag: '\uD83C\uDDEA\uD83C\uDDFA', event: 'ViDA Phase 1 Rollout', severity: 'warning' as const },
];

const countryDetails: Record<string, {
  flag: string; name: string; score: number; invoices: number;
  networks: string[]; formats: string[];
}> = {
  Belgium: { flag: '\uD83C\uDDE7\uD83C\uDDEA', name: 'Belgium', score: 99.2, invoices: 2847, networks: ['Peppol'], formats: ['UBL 2.1', 'Peppol BIS 3.0'] },
  Poland: { flag: '\uD83C\uDDF5\uD83C\uDDF1', name: 'Poland', score: 97.8, invoices: 3409, networks: ['KSeF'], formats: ['KSeF XML'] },
  France: { flag: '\uD83C\uDDEB\uD83C\uDDF7', name: 'France', score: 94.1, invoices: 1823, networks: ['PPF'], formats: ['Factur-X'] },
  Italy: { flag: '\uD83C\uDDEE\uD83C\uDDF9', name: 'Italy', score: 98.5, invoices: 2932, networks: ['SDI'], formats: ['FatturaPA 1.2'] },
  Germany: { flag: '\uD83C\uDDE9\uD83C\uDDEA', name: 'Germany', score: 96.3, invoices: 1330, networks: ['Peppol'], formats: ['UBL 2.1', 'Peppol BIS 3.0'] },
};

/* Country code -> name mapping for filtering */
const countryCodeMap: Record<string, string> = {
  BE: 'Belgium', PL: 'Poland', FR: 'France', IT: 'Italy', DE: 'Germany',
  NL: 'Netherlands', ES: 'Spain', NO: 'Norway', FI: 'Finland',
};

/* ── Strategic Bet 1: E-Invoicing as Competitive Moat ── */

const peppolReadiness = {
  overall: 34,
  segments: [
    { name: 'Enterprise', ready: 78, total: 320, color: '#165DFF' },
    { name: 'Mid-Market', ready: 42, total: 890, color: '#8E51DA' },
    { name: 'SMB', ready: 18, total: 1580, color: '#FF9A2E' },
  ],
  conversionMultiplier: 2.4,
  unrealizedRevenue: 17.8,
  unactivatedCustomers: 1190,
};

const competitivePositioning = [
  { vendor: 'Medius', peppolApproach: 'Peppol Access Point Owner', mandateCoverage: '14 EU markets', enterpriseReady: true, advantage: 'Proprietary network control', color: '#165DFF', highlight: true },
  { vendor: 'Coupa', peppolApproach: 'Partner-based Peppol', mandateCoverage: '9 EU markets', enterpriseReady: true, advantage: 'Slower, less control', color: '#86909C', highlight: false },
  { vendor: 'Tipalti', peppolApproach: 'Limited integration', mandateCoverage: '4 EU markets', enterpriseReady: false, advantage: 'Limited European mandate coverage', color: '#86909C', highlight: false },
  { vendor: 'Bill.com', peppolApproach: 'No Peppol support', mandateCoverage: '0 EU markets', enterpriseReady: false, advantage: 'SMB-only, no enterprise compliance moat', color: '#86909C', highlight: false },
  { vendor: 'SAP Concur', peppolApproach: 'Legacy integration', mandateCoverage: '11 EU markets', enterpriseReady: true, advantage: 'Legacy architecture, slower to adapt', color: '#86909C', highlight: false },
];

const winRateData = {
  withCompliance: 58,
  withoutCompliance: 34,
  uplift: 24,
  pipelineContribution: 2.8,
  pipelinePercent: 34,
  projectedRevenue: 8.2,
  cohorts: {
    ready: { nps: 87, retention: 96 },
    notReady: { nps: 62, retention: 78 },
  },
};

const iceScore = { impact: 9, confidence: 8, ease: 7, total: 24 };

/* Heatmap data: country x format pass rate */
const heatmapData: { country: string; format: string; rate: number }[] = [
  { country: 'BE', format: 'UBL 2.1', rate: 99.4 },
  { country: 'BE', format: 'Peppol BIS 3.0', rate: 98.8 },
  { country: 'BE', format: 'Factur-X / CII', rate: 96.2 },
  { country: 'PL', format: 'KSeF XML', rate: 97.1 },
  { country: 'PL', format: 'Peppol BIS 3.0', rate: 93.5 },
  { country: 'FR', format: 'Factur-X / CII', rate: 94.7 },
  { country: 'FR', format: 'UBL 2.1', rate: 91.2 },
  { country: 'IT', format: 'FatturaPA 1.2', rate: 98.9 },
  { country: 'IT', format: 'Peppol BIS 3.0', rate: 95.3 },
  { country: 'DE', format: 'UBL 2.1', rate: 96.8 },
  { country: 'DE', format: 'Peppol BIS 3.0', rate: 97.5 },
  { country: 'ES', format: 'UBL 2.1', rate: 99.0 },
  { country: 'NO', format: 'Peppol BIS 3.0', rate: 98.2 },
  { country: 'FI', format: 'Peppol BIS 3.0', rate: 95.8 },
];

const heatmapCountries = ['BE', 'PL', 'FR', 'IT', 'DE', 'ES', 'NO', 'FI'];
const heatmapFormats = ['UBL 2.1', 'Peppol BIS 3.0', 'Factur-X / CII', 'FatturaPA 1.2', 'KSeF XML'];

function getHeatmapRate(country: string, format: string): number | null {
  const entry = heatmapData.find((d) => d.country === country && d.format === format);
  return entry ? entry.rate : null;
}

function getHeatmapColor(rate: number): string {
  if (rate >= 98) return '#23C343';
  if (rate >= 95) return '#CA8A04';
  if (rate >= 90) return '#D97706';
  return '#DC2626';
}

/* ── Tab definitions ── */
const tabItems = [
  { label: 'Overview', value: 'overview' },
  { label: 'Regulations', value: 'regulations' },
  { label: 'Validation', value: 'validation' },
  { label: 'Networks', value: 'networks' },
  { label: 'Alerts', value: 'alerts' },
];

/* ── Helpers ── */

const totalDonutInvoices = jurisdictionScores.reduce((s, j) => s + j.invoices, 0);

function getCountryName(countryField: string): string | undefined {
  const code = countryField.replace(/[^\w]/g, '').trim();
  return countryCodeMap[code];
}

const validationCountries = Array.from(new Set(validationResults.map((v) => {
  const parts = v.country.split(' ');
  return parts[parts.length - 1];
})));

/* ──────────────────────────────────────────────
   PAGE COMPONENT
   ────────────────────────────────────────────── */

export default function CompliancePage() {
  const t = useT();

  /* ── Validation tab state ── */
  const [validationSearch, setValidationSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [validationFilter, setValidationFilter] = useState<'all' | 'pass' | 'warning' | 'fail'>('all');
  const [validationCountry, setValidationCountry] = useState('All');
  const [sortField, setSortField] = useState<string>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  /* ── Period selector ── */
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  /* ── Collapsible alert groups ── */
  const [expandedSeverities, setExpandedSeverities] = useState<Set<string>>(
    () => new Set(['critical', 'warning', 'info'])
  );

  /* ── Country drill-down modal ── */
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  /* ── Debounced search ── */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(validationSearch);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [validationSearch]);

  /* ── Filtered + sorted validation results ── */
  const filteredResults = useMemo(() => {
    let results = [...validationResults];

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      results = results.filter(
        (v) => v.id.toLowerCase().includes(q) || v.details.toLowerCase().includes(q)
      );
    }

    if (validationFilter !== 'all') {
      results = results.filter((v) => v.result === validationFilter);
    }

    if (validationCountry !== 'All') {
      results = results.filter((v) => v.country.includes(validationCountry));
    }

    results.sort((a, b) => {
      const fieldA = a[sortField as keyof typeof a] ?? '';
      const fieldB = b[sortField as keyof typeof b] ?? '';
      const cmp = String(fieldA).localeCompare(String(fieldB));
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return results;
  }, [debouncedSearch, validationFilter, validationCountry, sortField, sortDir]);

  /* ── Sort handler ── */
  const handleSort = useCallback((field: string) => {
    setSortField((prev) => {
      if (prev === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return field;
    });
  }, []);

  /* ── Collapsible toggle ── */
  const toggleSeverity = useCallback((sev: string) => {
    setExpandedSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(sev)) next.delete(sev);
      else next.add(sev);
      return next;
    });
  }, []);

  /* ── Country click handler ── */
  const openCountry = useCallback((name: string) => {
    if (countryDetails[name]) setSelectedCountry(name);
  }, []);

  /* ── Clickable country span ── */
  const CountryLink = ({ name, flag }: { name: string; flag?: string }) => (
    <span
      className={styles.countryClickable}
      onClick={() => openCountry(name)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') openCountry(name); }}
    >
      {flag ? `${flag} ` : ''}{name}
    </span>
  );

  /* ── Sparkline SVG points ── */
  const sparklinePoints = useMemo(() => {
    const rates = validationTrend.map((d) => (d.passed / d.total) * 100);
    const minR = Math.min(...rates);
    const maxR = Math.max(...rates);
    const range = maxR - minR || 1;
    return rates
      .map((r, i) => `${(i / (rates.length - 1)) * 120},${32 - ((r - minR) / range) * 28}`)
      .join(' ');
  }, []);

  /* ── Donut chart arcs ── */
  const donutArcs = useMemo(() => {
    const circumference = 2 * Math.PI * 70; // r=70
    let offset = 0;
    return jurisdictionScores.map((j) => {
      const fraction = j.invoices / totalDonutInvoices;
      const dashLength = fraction * circumference;
      const arc = { ...j, dashArray: `${dashLength} ${circumference - dashLength}`, dashOffset: -offset };
      offset += dashLength;
      return arc;
    });
  }, []);

  /* ── Validation trend max ── */
  const trendMax = useMemo(() => Math.max(...validationTrend.map((d) => d.total)), []);

  /* ── Calendar grouped by month ── */
  const calendarGrouped = useMemo(() => {
    const groups: Record<string, typeof regulatoryCalendar> = {};
    regulatoryCalendar.forEach((entry) => {
      const d = new Date(entry.date);
      const key = `${d.toLocaleString('en', { month: 'long' })} ${d.getFullYear()}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return Object.entries(groups);
  }, []);

  /* ── Alert groups ── */
  const alertGroups = useMemo(() => {
    const groups: Record<string, typeof alerts> = { critical: [], warning: [], info: [] };
    alerts.forEach((a) => groups[a.severity].push(a));
    return groups;
  }, []);

  /* ── Sort arrow indicator ── */
  const SortArrow = ({ field }: { field: string }) => (
    <span className={styles.sortArrow}>
      {sortField === field ? (sortDir === 'asc' ? '\u2191' : '\u2193') : '\u2195'}
    </span>
  );

  /* ── Country modal data ── */
  const modalData = useMemo(() => {
    if (!selectedCountry || !countryDetails[selectedCountry]) return null;
    const cd = countryDetails[selectedCountry];
    const mandate = mandates.find((m) => m.country === selectedCountry);
    const countryValidations = validationResults.filter((v) => {
      const name = getCountryName(v.country);
      return name === selectedCountry;
    });
    const countryAlerts = alerts.filter((a) =>
      a.title.toLowerCase().includes(selectedCountry.toLowerCase()) ||
      a.description.toLowerCase().includes(selectedCountry.toLowerCase())
    );
    const countryNetworks = networkStatus.filter((n) => cd.networks.includes(n.name));
    return { ...cd, mandate, validations: countryValidations, alerts: countryAlerts, networks: countryNetworks };
  }, [selectedCountry]);

  /* ── Render Helpers ── */

  const renderSortableHeader = (label: string, field: string) => (
    <th className={styles.sortableHeader} onClick={() => handleSort(field)}>
      {label} <SortArrow field={field} />
    </th>
  );

  /* ── Period display data ── */
  const periodStats = useMemo(() => {
    const multiplier = period === '7d' ? 1 : period === '30d' ? 4.3 : 12.9;
    const weekTotal = validationTrend.reduce((s, d) => s + d.total, 0);
    const weekPassed = validationTrend.reduce((s, d) => s + d.passed, 0);
    const weekFailed = validationTrend.reduce((s, d) => s + d.failed, 0);
    const weekWarnings = validationTrend.reduce((s, d) => s + d.warnings, 0);
    return {
      total: Math.round(weekTotal * multiplier),
      passed: Math.round(weekPassed * multiplier),
      failed: Math.round(weekFailed * multiplier),
      warnings: Math.round(weekWarnings * multiplier),
      rate: ((weekPassed / weekTotal) * 100).toFixed(1),
    };
  }, [period]);

  return (
    <div className={styles.page}>
      {/* ── Persistent Hero Header ── */}
      <header className={styles.hero}>
        <div className={styles.heroLeft}>
          <span className={styles.heroIcon} role="img" aria-label="compliance">{'\uD83D\uDEE1\uFE0F'}</span>
          <div>
            <h1 className={styles.heroTitle}>{t('compliance.title')}</h1>
            <p className={styles.heroSubtitle}>{t('compliance.subtitle')}</p>
          </div>
        </div>
        <div className={styles.heroRight}>
          <div className={styles.heroScoreBlock}>
            <span className={styles.heroScoreValue}>97.3%</span>
            <span className={styles.heroScoreLabel}>Compliance</span>
          </div>
          <span className={styles.heroTrendBadge}>
            <span className={styles.trendArrowUp}>{'\u2191'}</span>
            +1.2%
          </span>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaItem}>{'\uD83C\uDF0D'} 14 jurisdictions</span>
            <span className={styles.heroMetaDivider} />
            <span className={styles.heroMetaItem}>12,341 invoices</span>
          </div>
        </div>
      </header>

      {/* ── Tab-Based Layout ── */}
      <Tabs items={tabItems} defaultValue="overview">
        {(activeTab) => (
          <>
            {/* ═══════════ OVERVIEW TAB ═══════════ */}
            {activeTab === 'overview' && (
              <div>
                {/* Stats Row */}
                <div className={styles.statsRow}>
                  {stats.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                      <div className={styles.statIcon}>{stat.icon}</div>
                      <div className={styles.statValue}>{stat.value}</div>
                      <div className={styles.statLabel}>{stat.label}</div>
                      <div className={styles.statChange}>{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Period Selector */}
                <div className={styles.periodSelector}>
                  {(['7d', '30d', '90d'] as const).map((p) => (
                    <button
                      key={p}
                      className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
                      onClick={() => setPeriod(p)}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Period Stats Summary */}
                <div className={styles.periodStatsRow}>
                  <div className={styles.periodStatCard}>
                    <span className={styles.periodStatValue}>{periodStats.total.toLocaleString()}</span>
                    <span className={styles.periodStatLabel}>Total Validated</span>
                  </div>
                  <div className={styles.periodStatCard}>
                    <span className={`${styles.periodStatValue} ${styles.textGreen}`}>{periodStats.passed.toLocaleString()}</span>
                    <span className={styles.periodStatLabel}>Passed</span>
                  </div>
                  <div className={styles.periodStatCard}>
                    <span className={`${styles.periodStatValue} ${styles.textOrange}`}>{periodStats.warnings.toLocaleString()}</span>
                    <span className={styles.periodStatLabel}>Warnings</span>
                  </div>
                  <div className={styles.periodStatCard}>
                    <span className={`${styles.periodStatValue} ${styles.textRed}`}>{periodStats.failed.toLocaleString()}</span>
                    <span className={styles.periodStatLabel}>Failed</span>
                  </div>
                  <div className={styles.periodStatCard}>
                    <span className={`${styles.periodStatValue} ${styles.textGreen}`}>{periodStats.rate}%</span>
                    <span className={styles.periodStatLabel}>Pass Rate</span>
                  </div>
                </div>

                {/* ── Strategic Context Banner ── */}
                <div className={styles.strategicBanner}>
                  <div className={styles.strategicBannerTop}>
                    <div className={styles.strategicBannerLeft}>
                      <div className={styles.strategicBannerIcon}>{'\uD83D\uDEE1\uFE0F'}</div>
                      <div>
                        <h2 className={styles.strategicBannerTitle}>E-Invoicing: Compliance as Competitive Moat</h2>
                        <p className={styles.strategicBannerSubtitle}>
                          Belgium B2B Mandate <span className={styles.mandateLiveBadge}><span className={styles.mandateLiveDot} /> LIVE</span> &mdash; <strong>67% of EU companies lack Peppol readiness</strong> &mdash; your market opportunity
                        </p>
                      </div>
                    </div>
                    <div className={styles.strategicBannerIce}>
                      <div className={styles.iceScoreTotal}>
                        <span className={styles.iceScoreValue}>{iceScore.total}</span>
                        <span className={styles.iceScoreLabel}>ICE Score</span>
                      </div>
                      <div className={styles.iceBreakdown}>
                        <span className={styles.iceItem}>Impact <span className={styles.iceItemValue}>{iceScore.impact}</span></span>
                        <span className={styles.iceItem}>Confidence <span className={styles.iceItemValue}>{iceScore.confidence}</span></span>
                        <span className={styles.iceItem}>Ease <span className={styles.iceItemValue}>{iceScore.ease}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.strategicStatsRow}>
                    <div className={styles.strategicStatCard}>
                      <div className={styles.strategicStatValue}>
                        34% <span style={{ color: '#86909C', fontWeight: 400, fontSize: '0.875rem' }}>{'\u2192'}</span> <span className={styles.strategicHighlight} style={{ color: '#23C343' }}>58%</span>
                      </div>
                      <div className={styles.strategicStatLabel}>RFP Win Rate in compliance-mentioning deals (+24pp uplift)</div>
                    </div>
                    <div className={styles.strategicStatCard}>
                      <div className={styles.strategicStatValue} style={{ color: '#165DFF' }}>67%</div>
                      <div className={styles.strategicStatLabel}>EU customers with no Peppol readiness (addressable gap)</div>
                    </div>
                    <div className={styles.strategicStatCard}>
                      <div className={styles.strategicStatValue} style={{ color: '#8E51DA' }}>Bet 1</div>
                      <div className={styles.strategicStatLabel}>Strategic priority: Belgium B2B mandate drives urgency across EU</div>
                    </div>
                  </div>
                </div>

                {/* ── Peppol Readiness Dashboard ── */}
                <section className={styles.peppolSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Peppol Readiness Dashboard
                      <span className={styles.badge}>Customer Activation</span>
                    </div>
                    <span className={styles.sectionAction}>View Activation Pipeline</span>
                  </div>
                  <div className={styles.peppolGrid}>
                    <div className={styles.peppolSegments}>
                      <div className={styles.peppolOverallBar}>
                        <div className={styles.peppolOverallLabel}>
                          <span className={styles.peppolOverallText}>Overall Peppol-Activated</span>
                          <span className={styles.peppolOverallPercent}>{peppolReadiness.overall}%</span>
                        </div>
                        <div className={styles.peppolProgressTrack}>
                          <div className={styles.peppolProgressFill} style={{ width: `${peppolReadiness.overall}%`, background: 'linear-gradient(90deg, #165DFF, #8E51DA)' }} />
                        </div>
                      </div>
                      {peppolReadiness.segments.map((seg) => (
                        <div key={seg.name} className={styles.peppolSegmentRow}>
                          <div className={styles.peppolSegmentHeader}>
                            <span className={styles.peppolSegmentName}>{seg.name}</span>
                            <span className={styles.peppolSegmentStat}>
                              <span className={styles.peppolSegmentPercent} style={{ color: seg.color }}>{seg.ready}%</span>
                              {' '}ready ({Math.round(seg.total * seg.ready / 100).toLocaleString()} / {seg.total.toLocaleString()})
                            </span>
                          </div>
                          <div className={styles.peppolSegmentBar}>
                            <div className={styles.peppolSegmentFill} style={{ width: `${seg.ready}%`, backgroundColor: seg.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={styles.peppolInsights}>
                      <div className={styles.peppolInsightCard}>
                        <span className={styles.peppolInsightIcon}>{'\uD83D\uDD04'}</span>
                        <span className={styles.peppolInsightValue}>{peppolReadiness.conversionMultiplier}x</span>
                        <span className={styles.peppolInsightLabel}>
                          Peppol-ready customers are <span className={styles.peppolInsightHighlight}>{peppolReadiness.conversionMultiplier}x more likely</span> to expand license
                        </span>
                      </div>
                      <div className={styles.peppolInsightCard}>
                        <span className={styles.peppolInsightIcon}>{'\uD83D\uDCB0'}</span>
                        <span className={styles.peppolInsightValue}>${peppolReadiness.unrealizedRevenue}M</span>
                        <span className={styles.peppolInsightLabel}>
                          Unrealized revenue from <span className={styles.peppolInsightHighlight}>{peppolReadiness.unactivatedCustomers.toLocaleString()} unactivated customers</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Competitive Positioning ── */}
                <section className={styles.competitiveSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Competitive Positioning
                      <span className={styles.badge}>E-Invoicing Landscape</span>
                    </div>
                  </div>
                  <div className={styles.competitiveGrid}>
                    {competitivePositioning.map((comp) => (
                      <div key={comp.vendor} className={`${styles.competitiveCard} ${comp.highlight ? styles.competitiveCardHighlight : ''}`}>
                        <div className={styles.competitiveVendorName}>{comp.vendor}</div>
                        <div className={styles.competitiveDetail}>
                          <span className={styles.competitiveDetailLabel}>Peppol Approach</span>
                          <span className={styles.competitiveDetailValue}>{comp.peppolApproach}</span>
                        </div>
                        <div className={styles.competitiveDetail}>
                          <span className={styles.competitiveDetailLabel}>Mandate Coverage</span>
                          <span className={styles.competitiveDetailValue}>{comp.mandateCoverage}</span>
                        </div>
                        <div className={styles.competitiveCheckRow}>
                          {comp.enterpriseReady ? (
                            <><span className={styles.competitiveCheckYes}>{'\u2713'}</span> Enterprise Ready</>
                          ) : (
                            <><span className={styles.competitiveCheckNo}>{'\u2717'}</span> Enterprise Ready</>
                          )}
                        </div>
                        <div className={comp.highlight ? styles.competitiveAdvantageMedius : styles.competitiveAdvantage}>
                          {comp.advantage}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* ── Win Rate Impact ── */}
                <section className={styles.winRateSection}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Win Rate Impact
                      <span className={styles.badge}>Deal Intelligence</span>
                    </div>
                    <span className={styles.sectionAction}>View Pipeline Detail</span>
                  </div>
                  <div className={styles.winRateGrid}>
                    <div className={styles.winRateLeft}>
                      <div className={styles.winRateComparison}>
                        <div className={styles.winRateBar}>
                          <div className={styles.winRateBarValue}>{winRateData.withCompliance}%</div>
                          <div className={styles.winRateBarTrack}>
                            <div className={`${styles.winRateBarFill} ${styles.winRateBarFillGreen}`} style={{ height: `${winRateData.withCompliance}%` }} />
                          </div>
                          <div className={styles.winRateBarLabel}>With Compliance Narrative</div>
                        </div>
                        <div className={styles.winRateBar}>
                          <div className={styles.winRateBarValue}>{winRateData.withoutCompliance}%</div>
                          <div className={styles.winRateBarTrack}>
                            <div className={`${styles.winRateBarFill} ${styles.winRateBarFillGray}`} style={{ height: `${winRateData.withoutCompliance}%` }} />
                          </div>
                          <div className={styles.winRateBarLabel}>Without Compliance Narrative</div>
                        </div>
                      </div>
                      <div className={styles.winRateUplift}>
                        {'\u2191'} +{winRateData.uplift}pp Win Rate Uplift
                      </div>
                      <div className={styles.winRatePipeline}>
                        <div className={styles.winRatePipelineCard}>
                          <div className={styles.winRatePipelineValue}>${winRateData.pipelineContribution}M</div>
                          <div className={styles.winRatePipelineLabel}>Pipeline Contribution ({winRateData.pipelinePercent}% of open EU deals)</div>
                        </div>
                      </div>
                    </div>
                    <div className={styles.winRateRight}>
                      <h4 className={styles.winRateCohortTitle}>Customer Cohort Comparison</h4>
                      <div className={styles.winRateCohorts}>
                        <div className={`${styles.winRateCohortCard} ${styles.winRateCohortCardReady}`}>
                          <span className={styles.winRateCohortLabel}>Compliance-Ready Customers</span>
                          <div className={styles.winRateCohortStats}>
                            <div className={styles.winRateCohortStat}>
                              <span className={styles.winRateCohortStatValue} style={{ color: '#23C343' }}>{winRateData.cohorts.ready.nps}</span>
                              <span className={styles.winRateCohortStatLabel}>NPS</span>
                            </div>
                            <div className={styles.winRateCohortStat}>
                              <span className={styles.winRateCohortStatValue} style={{ color: '#23C343' }}>{winRateData.cohorts.ready.retention}%</span>
                              <span className={styles.winRateCohortStatLabel}>Retention</span>
                            </div>
                          </div>
                        </div>
                        <div className={`${styles.winRateCohortCard} ${styles.winRateCohortCardNotReady}`}>
                          <span className={styles.winRateCohortLabel}>Not-Ready Customers</span>
                          <div className={styles.winRateCohortStats}>
                            <div className={styles.winRateCohortStat}>
                              <span className={styles.winRateCohortStatValue} style={{ color: '#F76560' }}>{winRateData.cohorts.notReady.nps}</span>
                              <span className={styles.winRateCohortStatLabel}>NPS</span>
                            </div>
                            <div className={styles.winRateCohortStat}>
                              <span className={styles.winRateCohortStatValue} style={{ color: '#F76560' }}>{winRateData.cohorts.notReady.retention}%</span>
                              <span className={styles.winRateCohortStatLabel}>Retention</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={styles.winRateProjection}>
                        <div className={styles.winRateProjectionValue}>+${winRateData.projectedRevenue}M</div>
                        <div className={styles.winRateProjectionLabel}>Projected 2026 revenue impact from mandate momentum</div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Compliance Score Donut + Legend */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Compliance Score by Jurisdiction
                      <span className={styles.badge}>{jurisdictionScores.length} countries</span>
                    </div>
                  </div>
                  <div className={styles.donutLayout}>
                    <div className={styles.donutContainer}>
                      <svg viewBox="0 0 200 200" className={styles.donutSvg}>
                        {donutArcs.map((arc) => (
                          <circle
                            key={arc.country}
                            cx="100"
                            cy="100"
                            r="70"
                            fill="none"
                            stroke={arc.color}
                            strokeWidth="24"
                            strokeDasharray={arc.dashArray}
                            strokeDashoffset={arc.dashOffset}
                            transform="rotate(-90 100 100)"
                            className={styles.donutSegment}
                          />
                        ))}
                        <text x="100" y="92" textAnchor="middle" className={styles.donutCenterValue}>97.3%</text>
                        <text x="100" y="114" textAnchor="middle" className={styles.donutCenterLabel}>Overall Score</text>
                      </svg>
                    </div>
                    <div className={styles.donutLegend}>
                      {jurisdictionScores.map((j) => (
                        <div key={j.country} className={styles.donutLegendRow}>
                          <span className={styles.donutLegendColor} style={{ backgroundColor: j.color }} />
                          <CountryLink name={j.country} flag={j.flag} />
                          <span className={styles.donutLegendScore}>{j.score}%</span>
                          <span className={styles.donutLegendInvoices}>{j.invoices.toLocaleString()} inv.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Recent Alerts Summary (top 3) */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Recent Alerts
                      <span className={styles.badgeCritical}>2 critical</span>
                    </div>
                    <span className={styles.sectionAction}>View All</span>
                  </div>
                  <div className={styles.alertGrid}>
                    {alerts.slice(0, 3).map((alert, i) => (
                      <div key={i} className={`${styles.alertCard} ${
                        alert.severity === 'critical' ? styles.alertCardCritical :
                        alert.severity === 'warning' ? styles.alertCardWarning :
                        styles.alertCardInfo
                      }`}>
                        <div className={styles.alertCardTop}>
                          <span className={`${styles.alertSeverity} ${
                            alert.severity === 'critical' ? styles.severityCritical :
                            alert.severity === 'warning' ? styles.severityWarning :
                            styles.severityInfo
                          }`}>{alert.severity.toUpperCase()}</span>
                          <span className={styles.alertTime}>{alert.time}</span>
                        </div>
                        <div className={styles.alertCardTitle}>{alert.title}</div>
                        <div className={styles.alertCardDesc}>{alert.description}</div>
                        <button className={`${styles.alertActionBtn} ${
                          alert.severity === 'critical' ? styles.alertActionCritical :
                          alert.severity === 'warning' ? styles.alertActionWarning :
                          styles.alertActionInfo
                        }`}>{alert.action}</button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ═══════════ REGULATIONS TAB ═══════════ */}
            {activeTab === 'regulations' && (
              <div>
                {/* Regulatory Timeline */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Regulatory Timeline
                      <span className={styles.badge}>5 mandates</span>
                    </div>
                    <span className={styles.sectionAction}>View Full Calendar</span>
                  </div>
                  <div className={styles.timelineTrack}>
                    <div className={styles.timelineLine} />
                    {mandates.map((m, index) => (
                      <div key={m.country} className={styles.timelineItem} style={{ zIndex: mandates.length - index }}>
                        <div className={styles.timelineDot} style={{ borderColor: m.color, background: m.readiness === 100 ? m.color : '#ffffff' }} />
                        <div className={styles.timelineCard}>
                          <div className={styles.timelineCardHeader}>
                            <span className={styles.timelineFlag}>{m.flag}</span>
                            <div className={styles.timelineCardInfo}>
                              <CountryLink name={m.country} />
                              <span className={styles.timelineSystem}>{m.system}</span>
                            </div>
                            <span className={`${styles.timelineStatus} ${
                              m.status === 'live' ? styles.timelineStatusLive :
                              m.status === 'ready' ? styles.timelineStatusReady :
                              m.status === 'progress' ? styles.timelineStatusProgress :
                              m.status === 'planning' ? styles.timelineStatusPlanning :
                              styles.timelineStatusMonitoring
                            }`}>{m.statusLabel}</span>
                          </div>
                          <div className={styles.timelineDeadline}>Deadline: {m.deadline}</div>
                          <div className={styles.timelineProgressOuter}>
                            <div className={styles.timelineProgressInner} style={{ width: `${m.readiness}%`, backgroundColor: m.color }} />
                          </div>
                          <div className={styles.timelineReadiness}>{m.readiness}% readiness</div>
                          <div className={styles.timelineRequirements}>
                            {m.requirements.map((req) => (
                              <span key={req} className={styles.requirementTag}>{req}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Format Transformation Matrix + Heatmap */}
                <div className={styles.dualGrid}>
                  <section className={styles.section} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>
                        Format Transformation
                        <span className={styles.badge}>5 formats</span>
                      </div>
                    </div>
                    <div className={styles.matrixWrapper}>
                      <table className={styles.matrixTable}>
                        <thead>
                          <tr>
                            <th className={styles.matrixCorner}>From / To</th>
                            {formatMatrix.formats.map((f) => (
                              <th key={f} className={styles.matrixHeader}>{f}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {formatMatrix.formats.map((fromFormat, rowIdx) => (
                            <tr key={fromFormat}>
                              <td className={styles.matrixRowLabel}>{fromFormat}</td>
                              {formatMatrix.conversions[rowIdx].map((val, colIdx) => (
                                <td key={colIdx} className={styles.matrixCell}>
                                  {val === 'self' ? (
                                    <span className={styles.matrixSelf}>{'\u2014'}</span>
                                  ) : val === 'full' ? (
                                    <span className={styles.matrixFull}>{'\u2713'}</span>
                                  ) : (
                                    <span className={styles.matrixPartial}>{'\u25D0'}</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className={styles.matrixLegend}>
                        <span className={styles.legendItem}>
                          <span className={styles.matrixFull}>{'\u2713'}</span> Full Support
                        </span>
                        <span className={styles.legendItem}>
                          <span className={styles.matrixPartial}>{'\u25D0'}</span> Partial Support
                        </span>
                        <span className={styles.legendItem}>
                          <span className={styles.matrixSelf}>{'\u2014'}</span> Same Format
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Country x Format Heatmap */}
                  <section className={styles.section} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>
                        Compliance Heatmap
                        <span className={styles.badge}>Country x Format</span>
                      </div>
                    </div>
                    <div className={styles.heatmapWrapper}>
                      <table className={styles.heatmapTable}>
                        <thead>
                          <tr>
                            <th className={styles.heatmapCorner}></th>
                            {heatmapFormats.map((f) => (
                              <th key={f} className={styles.heatmapHeader}>{f}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {heatmapCountries.map((c) => (
                            <tr key={c}>
                              <td className={styles.heatmapRowLabel}>{c}</td>
                              {heatmapFormats.map((f) => {
                                const rate = getHeatmapRate(c, f);
                                return (
                                  <td key={f} className={styles.heatmapCell}>
                                    {rate !== null ? (
                                      <span
                                        className={styles.heatmapValue}
                                        style={{ backgroundColor: `${getHeatmapColor(rate)}20`, color: getHeatmapColor(rate) }}
                                      >
                                        {rate.toFixed(1)}%
                                      </span>
                                    ) : (
                                      <span className={styles.heatmapEmpty}>{'\u2014'}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* Regulatory Calendar */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Regulatory Calendar
                      <span className={styles.badge}>{regulatoryCalendar.length} events</span>
                    </div>
                  </div>
                  <div className={styles.calendarTimeline}>
                    {calendarGrouped.map(([month, entries]) => (
                      <div key={month} className={styles.calendarGroup}>
                        <div className={styles.calendarMonth}>{month}</div>
                        {entries.map((entry, i) => (
                          <div key={i} className={styles.calendarEntry}>
                            <div className={styles.calendarDotLine}>
                              <span className={`${styles.calendarDot} ${
                                entry.severity === 'critical' ? styles.calendarDotCritical :
                                entry.severity === 'warning' ? styles.calendarDotWarning :
                                styles.calendarDotInfo
                              }`} />
                              {i < entries.length - 1 && <span className={styles.calendarConnector} />}
                            </div>
                            <div className={styles.calendarContent}>
                              <div className={styles.calendarDate}>{entry.date}</div>
                              <div className={styles.calendarEventRow}>
                                <span>{entry.flag}</span>
                                <CountryLink name={entry.country} />
                                <span className={styles.calendarEventName}>{entry.event}</span>
                                <span className={`${styles.calendarSeverity} ${
                                  entry.severity === 'critical' ? styles.severityCritical :
                                  entry.severity === 'warning' ? styles.severityWarning :
                                  styles.severityInfo
                                }`}>{entry.severity.toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ═══════════ VALIDATION TAB ═══════════ */}
            {activeTab === 'validation' && (
              <div>
                {/* Validation Header with Sparkline */}
                <div className={styles.validationHeader}>
                  <div>
                    <div className={styles.sectionTitle}>
                      {t('compliance.validationResults')}
                      <span className={styles.badge}>{filteredResults.length} results</span>
                    </div>
                    <span className={styles.sectionAction}>Export Validation Log</span>
                  </div>
                  <div className={styles.sparklineContainer}>
                    <span className={styles.sparklineLabel}>7-day pass rate</span>
                    <svg width="120" height="32" viewBox="0 0 120 32" className={styles.sparklineSvg}>
                      <defs>
                        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#23C343" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#23C343" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      <polygon
                        points={`0,32 ${sparklinePoints} 120,32`}
                        fill="url(#sparkGrad)"
                      />
                      <polyline
                        points={sparklinePoints}
                        fill="none"
                        stroke="#23C343"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Period Selector */}
                <div className={styles.periodSelector}>
                  {(['7d', '30d', '90d'] as const).map((p) => (
                    <button
                      key={p}
                      className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
                      onClick={() => setPeriod(p)}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                  <div className={styles.periodStatsInline}>
                    <span>{periodStats.total.toLocaleString()} validated</span>
                    <span className={styles.textGreen}>{periodStats.rate}% pass rate</span>
                  </div>
                </div>

                {/* Search / Filter Bar */}
                <div className={styles.filterBar}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search by invoice ID or details..."
                    value={validationSearch}
                    onChange={(e) => setValidationSearch(e.target.value)}
                  />
                  <div className={styles.filterButtons}>
                    {(['all', 'pass', 'warning', 'fail'] as const).map((f) => (
                      <button
                        key={f}
                        className={`${styles.filterBtn} ${validationFilter === f ? styles.filterBtnActive : ''}`}
                        onClick={() => setValidationFilter(f)}
                      >
                        {f === 'all' ? 'All' : f === 'pass' ? 'Pass' : f === 'warning' ? 'Warning' : 'Fail'}
                      </button>
                    ))}
                  </div>
                  <select
                    className={styles.countryDropdown}
                    value={validationCountry}
                    onChange={(e) => setValidationCountry(e.target.value)}
                  >
                    <option value="All">All Countries</option>
                    {validationCountries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Validation Results Table */}
                <section className={styles.section}>
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          {renderSortableHeader('Invoice #', 'id')}
                          {renderSortableHeader(t('compliance.format'), 'format')}
                          {renderSortableHeader(t('compliance.country'), 'country')}
                          <th>Check Type</th>
                          {renderSortableHeader('Result', 'result')}
                          <th>Details</th>
                          {renderSortableHeader('Timestamp', 'timestamp')}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.length === 0 ? (
                          <tr><td colSpan={7} className={styles.emptyRow}>No results match your filters</td></tr>
                        ) : (
                          filteredResults.map((v) => (
                            <tr key={v.id}>
                              <td className={styles.monoCell}>{v.id}</td>
                              <td>{v.format}</td>
                              <td>{v.country}</td>
                              <td><span className={styles.checkTypeBadge}>{v.checkType}</span></td>
                              <td>
                                <span className={`${styles.resultBadge} ${
                                  v.result === 'pass' ? styles.resultPass :
                                  v.result === 'fail' ? styles.resultFail :
                                  styles.resultWarning
                                }`}>
                                  {v.result === 'pass' ? t('compliance.passed') : v.result === 'fail' ? t('compliance.failed') : t('compliance.warnings')}
                                </span>
                              </td>
                              <td className={styles.detailsCell}>{v.details}</td>
                              <td className={styles.timestampCell}>{v.timestamp}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Error Breakdown + Stacked Bar + Volume Chart */}
                <div className={styles.dualGrid}>
                  <section className={styles.section} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>
                        Error Breakdown
                        <span className={styles.badge}>89 total</span>
                      </div>
                    </div>
                    {/* Stacked Error Bar */}
                    <div className={styles.stackedBar}>
                      {errorBreakdown.map((err) => (
                        <div
                          key={err.label}
                          className={styles.stackedBarSegment}
                          style={{
                            width: `${(err.count / 89) * 100}%`,
                            backgroundColor: err.color,
                          }}
                          title={`${err.label}: ${err.count}`}
                        />
                      ))}
                    </div>
                    <div className={styles.errorList}>
                      {errorBreakdown.map((err) => (
                        <div key={err.label} className={styles.errorItem}>
                          <div className={styles.errorItemHeader}>
                            <span className={styles.errorItemLabel}>{err.label}</span>
                            <span className={styles.errorItemCount} style={{ color: err.color }}>{err.count}</span>
                          </div>
                          <div className={styles.errorBarTrack}>
                            <div className={styles.errorBarFill} style={{ width: `${(err.count / maxErrorCount) * 100}%`, backgroundColor: err.color }} />
                          </div>
                          <div className={styles.errorItemPercent}>{((err.count / 89) * 100).toFixed(1)}% of total</div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Daily Validation Volume Chart */}
                  <section className={styles.section} style={{ marginBottom: 0 }}>
                    <div className={styles.sectionHeader}>
                      <div className={styles.sectionTitle}>
                        Daily Validation Volume
                        <span className={styles.badge}>Last 7 days</span>
                      </div>
                    </div>
                    <div className={styles.volumeChart}>
                      {validationTrend.map((d) => (
                        <div key={d.day} className={styles.volumeBarCol}>
                          <div className={styles.volumeBarStack} style={{ height: `${(d.total / trendMax) * 140}px` }}>
                            <div className={styles.volumeSegFail} style={{ height: `${(d.failed / d.total) * 100}%` }} />
                            <div className={styles.volumeSegWarn} style={{ height: `${(d.warnings / d.total) * 100}%` }} />
                            <div className={styles.volumeSegPass} style={{ height: `${(d.passed / d.total) * 100}%` }} />
                          </div>
                          <span className={styles.volumeLabel}>{d.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.volumeLegend}>
                      <span className={styles.legendItem}><span className={styles.volumeLegendDotPass} /> Passed</span>
                      <span className={styles.legendItem}><span className={styles.volumeLegendDotWarn} /> Warnings</span>
                      <span className={styles.legendItem}><span className={styles.volumeLegendDotFail} /> Failed</span>
                    </div>
                  </section>
                </div>

                {/* Audit Trail */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Audit Trail
                      <span className={styles.badge}>{auditTrail.length} events</span>
                    </div>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Event</th>
                          <th>Detail</th>
                          <th>User</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditTrail.map((entry, i) => (
                          <tr key={i}>
                            <td className={styles.timestampCell}>{entry.timestamp}</td>
                            <td className={styles.auditEvent}>{entry.event}</td>
                            <td className={styles.detailsCell}>{entry.detail}</td>
                            <td>{entry.user}</td>
                            <td>
                              <span className={`${styles.auditTypeBadge} ${
                                entry.type === 'config' ? styles.auditTypeConfig :
                                entry.type === 'security' ? styles.auditTypeSecurity :
                                entry.type === 'validation' ? styles.auditTypeValidation :
                                styles.auditTypeRegulatory
                              }`}>{entry.type}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {/* ═══════════ NETWORKS TAB ═══════════ */}
            {activeTab === 'networks' && (
              <div>
                {/* E-Invoice Network Status */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      {t('compliance.networkStatus')}
                      <span className={styles.badge}>6 networks</span>
                    </div>
                    <span className={styles.sectionAction}>Network Dashboard</span>
                  </div>
                  <div className={styles.networkGrid}>
                    {networkStatus.map((net) => (
                      <div key={net.name} className={styles.networkCard}>
                        <div className={styles.networkCardHeader}>
                          <div className={styles.networkIconBox} style={{ backgroundColor: `${net.color}20`, borderColor: `${net.color}40` }}>
                            <span style={{ color: net.color, fontWeight: 700, fontSize: '0.75rem' }}>{net.icon}</span>
                          </div>
                          <div className={styles.networkCardInfo}>
                            <span className={styles.networkCardName}>{net.name}</span>
                            <span className={styles.networkCardType}>{net.type}</span>
                          </div>
                          <span className={`${styles.networkStatusDot} ${
                            net.status === 'connected' ? styles.networkStatusConnected :
                            styles.networkStatusTesting
                          }`} />
                        </div>
                        <div className={styles.networkCardStats}>
                          <div className={styles.networkStat}>
                            <span className={styles.networkStatLabel}>{t('compliance.status')}</span>
                            <span className={`${styles.networkStatValue} ${
                              net.status === 'connected' ? styles.networkStatConnected : styles.networkStatTesting
                            }`}>{net.statusLabel}</span>
                          </div>
                          <div className={styles.networkStat}>
                            <span className={styles.networkStatLabel}>Messages Today</span>
                            <span className={styles.networkStatValue}>
                              {net.messagesToday.toLocaleString()}{net.status === 'testing' ? ' (test)' : ''}
                            </span>
                          </div>
                          <div className={styles.networkStat}>
                            <span className={styles.networkStatLabel}>Uptime</span>
                            <span className={styles.networkStatValue}>{net.uptime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Digital Signature Status */}
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Digital Signature Status
                      <span className={styles.badge}>5 certificates</span>
                    </div>
                    <span className={styles.sectionAction}>Manage Certificates</span>
                  </div>
                  <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                      <thead>
                        <tr>
                          <th>Certificate Name</th>
                          <th>Algorithm</th>
                          <th>Valid Documents</th>
                          <th>{t('compliance.deadline')}</th>
                          <th>{t('compliance.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {signatures.map((sig) => (
                          <tr key={sig.name}>
                            <td className={styles.certName}>{sig.name}</td>
                            <td className={styles.monoCell}>{sig.algorithm}</td>
                            <td>{sig.validDocs.toLocaleString()}</td>
                            <td>{sig.expiry}</td>
                            <td>
                              <span className={`${styles.resultBadge} ${
                                sig.status === 'valid' ? styles.resultPass : styles.resultWarning
                              }`}>
                                {sig.status === 'valid' ? 'VALID' : 'RENEWAL NEEDED'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {/* ═══════════ ALERTS TAB ═══════════ */}
            {activeTab === 'alerts' && (
              <div>
                <section className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      Compliance Alerts
                      <span className={styles.badgeCritical}>{alertGroups.critical.length} critical</span>
                      <span className={styles.badgeWarning}>{alertGroups.warning.length} warnings</span>
                      <span className={styles.badge}>{alertGroups.info.length} info</span>
                    </div>
                  </div>

                  {(['critical', 'warning', 'info'] as const).map((sev) => (
                    <div key={sev} className={styles.collapsibleGroup}>
                      <button
                        className={styles.collapsibleHeader}
                        onClick={() => toggleSeverity(sev)}
                      >
                        <span className={`${styles.collapsibleChevron} ${expandedSeverities.has(sev) ? styles.chevronExpanded : ''}`}>
                          {'\u25B6'}
                        </span>
                        <span className={`${styles.alertSeverity} ${
                          sev === 'critical' ? styles.severityCritical :
                          sev === 'warning' ? styles.severityWarning :
                          styles.severityInfo
                        }`}>{sev.toUpperCase()}</span>
                        <span className={styles.collapsibleCount}>{alertGroups[sev].length} alerts</span>
                      </button>
                      {expandedSeverities.has(sev) && (
                        <div className={styles.collapsibleContent}>
                          <div className={styles.alertGrid}>
                            {alertGroups[sev].map((alert, i) => (
                              <div key={i} className={`${styles.alertCard} ${
                                alert.severity === 'critical' ? styles.alertCardCritical :
                                alert.severity === 'warning' ? styles.alertCardWarning :
                                styles.alertCardInfo
                              }`}>
                                <div className={styles.alertCardTop}>
                                  <span className={`${styles.alertSeverity} ${
                                    alert.severity === 'critical' ? styles.severityCritical :
                                    alert.severity === 'warning' ? styles.severityWarning :
                                    styles.severityInfo
                                  }`}>{alert.severity.toUpperCase()}</span>
                                  <span className={styles.alertTime}>{alert.time}</span>
                                </div>
                                <div className={styles.alertCardTitle}>{alert.title}</div>
                                <div className={styles.alertCardDesc}>{alert.description}</div>
                                <button className={`${styles.alertActionBtn} ${
                                  alert.severity === 'critical' ? styles.alertActionCritical :
                                  alert.severity === 'warning' ? styles.alertActionWarning :
                                  styles.alertActionInfo
                                }`}>{alert.action}</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              </div>
            )}
          </>
        )}
      </Tabs>

      {/* ── Country Drill-Down Modal ── */}
      <Modal
        open={selectedCountry !== null}
        onClose={() => setSelectedCountry(null)}
        title={modalData ? `${modalData.flag} ${modalData.name} — Compliance Detail` : ''}
        size="lg"
      >
        {modalData && (
          <div className={styles.modalBody}>
            {/* Score header */}
            <div className={styles.modalScoreHeader}>
              <div className={styles.modalScoreValue} style={{ color: modalData.score >= 97 ? '#23C343' : modalData.score >= 95 ? '#D97706' : '#DC2626' }}>
                {modalData.score}%
              </div>
              <div className={styles.modalScoreMeta}>
                Compliance Score &middot; {modalData.invoices.toLocaleString()} invoices
              </div>
            </div>

            {/* Mandate status */}
            {modalData.mandate && (
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Mandate Status</h4>
                <div className={styles.modalMandateCard}>
                  <div className={styles.modalMandateRow}>
                    <span>{modalData.mandate.system}</span>
                    <span className={`${styles.timelineStatus} ${
                      modalData.mandate.status === 'live' ? styles.timelineStatusLive :
                      modalData.mandate.status === 'ready' ? styles.timelineStatusReady :
                      modalData.mandate.status === 'progress' ? styles.timelineStatusProgress :
                      modalData.mandate.status === 'planning' ? styles.timelineStatusPlanning :
                      styles.timelineStatusMonitoring
                    }`}>{modalData.mandate.statusLabel}</span>
                  </div>
                  <div className={styles.timelineProgressOuter}>
                    <div className={styles.timelineProgressInner} style={{ width: `${modalData.mandate.readiness}%`, backgroundColor: modalData.mandate.color }} />
                  </div>
                  <div className={styles.timelineReadiness}>{modalData.mandate.readiness}% readiness &middot; Deadline: {modalData.mandate.deadline}</div>
                </div>
              </div>
            )}

            {/* Validation stats */}
            <div className={styles.modalSection}>
              <h4 className={styles.modalSectionTitle}>Recent Validations ({modalData.validations.length})</h4>
              {modalData.validations.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Result</th>
                        <th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.validations.slice(0, 5).map((v) => (
                        <tr key={v.id}>
                          <td className={styles.monoCell}>{v.id}</td>
                          <td>
                            <span className={`${styles.resultBadge} ${
                              v.result === 'pass' ? styles.resultPass :
                              v.result === 'fail' ? styles.resultFail :
                              styles.resultWarning
                            }`}>
                              {v.result.toUpperCase()}
                            </span>
                          </td>
                          <td className={styles.detailsCell}>{v.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.modalEmpty}>No recent validations for this country</p>
              )}
            </div>

            {/* Networks */}
            <div className={styles.modalSection}>
              <h4 className={styles.modalSectionTitle}>Connected Networks</h4>
              <div className={styles.modalNetworkList}>
                {modalData.networks.map((net) => (
                  <div key={net.name} className={styles.modalNetworkItem}>
                    <span className={`${styles.networkStatusDot} ${
                      net.status === 'connected' ? styles.networkStatusConnected : styles.networkStatusTesting
                    }`} />
                    <span>{net.name}</span>
                    <span className={styles.modalNetworkUptime}>{net.uptime} uptime</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts for this country */}
            {modalData.alerts.length > 0 && (
              <div className={styles.modalSection}>
                <h4 className={styles.modalSectionTitle}>Related Alerts ({modalData.alerts.length})</h4>
                {modalData.alerts.map((alert, i) => (
                  <div key={i} className={`${styles.alertCard} ${
                    alert.severity === 'critical' ? styles.alertCardCritical :
                    alert.severity === 'warning' ? styles.alertCardWarning :
                    styles.alertCardInfo
                  }`} style={{ marginBottom: '0.5rem' }}>
                    <div className={styles.alertCardTop}>
                      <span className={`${styles.alertSeverity} ${
                        alert.severity === 'critical' ? styles.severityCritical :
                        alert.severity === 'warning' ? styles.severityWarning :
                        styles.severityInfo
                      }`}>{alert.severity.toUpperCase()}</span>
                      <span className={styles.alertTime}>{alert.time}</span>
                    </div>
                    <div className={styles.alertCardTitle}>{alert.title}</div>
                    <div className={styles.alertCardDesc}>{alert.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
