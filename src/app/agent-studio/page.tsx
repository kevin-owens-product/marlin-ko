'use client';

import React, { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './agent-studio.module.css';

/* ═══════════════════════════════════════════════════════════════
   Mock Data - Pipeline Stages
   ═══════════════════════════════════════════════════════════════ */

const pipelineStages = [
  { name: 'Capture', agent: 'Capture Agent', status: 'active' as const, docsToday: 127, accuracy: 99.1, latency: '1.2s' },
  { name: 'Classification', agent: 'Classification Agent', status: 'active' as const, docsToday: 124, accuracy: 97.8, latency: '0.8s' },
  { name: 'Compliance', agent: 'Compliance Agent', status: 'active' as const, docsToday: 121, accuracy: 99.7, latency: '2.1s' },
  { name: 'Matching', agent: 'Matching Agent', status: 'active' as const, docsToday: 118, accuracy: 96.3, latency: '1.5s' },
  { name: 'Risk', agent: 'Risk Agent', status: 'active' as const, docsToday: 115, accuracy: 98.2, latency: '0.9s' },
  { name: 'Approval', agent: 'Approval Agent', status: 'idle' as const, docsToday: 108, accuracy: 97.5, latency: '3.1s' },
  { name: 'Payment', agent: 'Payment Agent', status: 'active' as const, docsToday: 94, accuracy: 99.9, latency: '2.8s' },
  { name: 'Communication', agent: 'Communication Agent', status: 'active' as const, docsToday: 89, accuracy: 98.6, latency: '1.4s' },
];

/* ═══════════════════════════════════════════════════════════════
   Mock Data - Agent Health
   ═══════════════════════════════════════════════════════════════ */

interface AgentHealth {
  name: string;
  icon: string;
  iconBg: string;
  status: 'active' | 'idle' | 'error';
  autonomy: 'High' | 'Medium' | 'Low';
  docsToday: number;
  accuracy: number;
  sparkline: number[];
  latency: string;
  queueDepth: number;
  lastError: string | null;
  enabled: boolean;
}

const initialAgents: AgentHealth[] = [
  {
    name: 'Capture Agent',
    icon: '\uD83D\uDCF7',
    iconBg: 'rgba(59,130,246,0.15)',
    status: 'active',
    autonomy: 'High',
    docsToday: 127,
    accuracy: 99.1,
    sparkline: [95, 97, 98, 99, 98, 99, 99],
    latency: '1.2s',
    queueDepth: 24,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Classification Agent',
    icon: '\uD83C\uDFF7\uFE0F',
    iconBg: 'rgba(139,92,246,0.15)',
    status: 'active',
    autonomy: 'High',
    docsToday: 124,
    accuracy: 97.8,
    sparkline: [94, 96, 97, 96, 98, 97, 98],
    latency: '0.8s',
    queueDepth: 18,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Compliance Agent',
    icon: '\uD83D\uDEE1\uFE0F',
    iconBg: 'rgba(6,182,212,0.15)',
    status: 'active',
    autonomy: 'Medium',
    docsToday: 121,
    accuracy: 99.7,
    sparkline: [99, 99, 100, 99, 100, 100, 100],
    latency: '2.1s',
    queueDepth: 15,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Matching Agent',
    icon: '\uD83D\uDD17',
    iconBg: 'rgba(245,158,11,0.15)',
    status: 'active',
    autonomy: 'High',
    docsToday: 118,
    accuracy: 96.3,
    sparkline: [93, 94, 95, 96, 95, 97, 96],
    latency: '1.5s',
    queueDepth: 31,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Risk Agent',
    icon: '\uD83D\uDEA8',
    iconBg: 'rgba(239,68,68,0.15)',
    status: 'active',
    autonomy: 'Medium',
    docsToday: 115,
    accuracy: 98.2,
    sparkline: [96, 97, 97, 98, 98, 99, 98],
    latency: '0.9s',
    queueDepth: 8,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Approval Agent',
    icon: '\u2705',
    iconBg: 'rgba(16,185,129,0.15)',
    status: 'idle',
    autonomy: 'Low',
    docsToday: 108,
    accuracy: 97.5,
    sparkline: [95, 96, 97, 96, 98, 97, 98],
    latency: '3.1s',
    queueDepth: 23,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Payment Agent',
    icon: '\uD83D\uDCB3',
    iconBg: 'rgba(16,185,129,0.15)',
    status: 'active',
    autonomy: 'Medium',
    docsToday: 94,
    accuracy: 99.9,
    sparkline: [99, 100, 100, 99, 100, 100, 100],
    latency: '2.8s',
    queueDepth: 12,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Communication Agent',
    icon: '\uD83D\uDCE8',
    iconBg: 'rgba(139,92,246,0.15)',
    status: 'active',
    autonomy: 'High',
    docsToday: 89,
    accuracy: 98.6,
    sparkline: [96, 97, 98, 98, 99, 98, 99],
    latency: '1.4s',
    queueDepth: 6,
    lastError: null,
    enabled: true,
  },
  {
    name: 'Advisory Agent',
    icon: '\uD83E\uDDE0',
    iconBg: 'rgba(245,158,11,0.15)',
    status: 'error',
    autonomy: 'Low',
    docsToday: 51,
    accuracy: 94.1,
    sparkline: [90, 92, 93, 91, 94, 93, 94],
    latency: '4.7s',
    queueDepth: 47,
    lastError: 'Model timeout on complex advisory (INV-9821)',
    enabled: true,
  },
];

/* ═══════════════════════════════════════════════════════════════
   Mock Data - Decisions
   ═══════════════════════════════════════════════════════════════ */

interface Decision {
  id: string;
  timestamp: string;
  agent: string;
  invoice: string;
  action: string;
  confidence: number;
  reasoning: string;
  outcome: 'Executed' | 'Queued' | 'Blocked';
  humanOverride: boolean;
  factors: { name: string; weight: number; score: number; color: string }[];
  alternatives: { action: string; confidence: number }[];
  pastDecisions: { id: string; action: string; outcome: string }[];
}

const decisions: Decision[] = [
  {
    id: 'DEC-001', timestamp: '2026-01-30 09:47:12', agent: 'Matching Agent', invoice: 'INV-9847',
    action: 'Auto-matched to PO-2239', confidence: 98.7,
    reasoning: 'Three-way match succeeded: invoice amount EUR 12,450.00 matches PO-2239 line items within 0.2% tolerance. Goods receipt GR-1102 confirmed delivery of all items. Supplier TechCorp verified. Historical pattern shows 47 prior successful matches with this supplier.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Amount Match', weight: 0.35, score: 99.2, color: '#23C343' },
      { name: 'PO Alignment', weight: 0.25, score: 98.5, color: '#165DFF' },
      { name: 'GR Confirmation', weight: 0.20, score: 100.0, color: '#8E51DA' },
      { name: 'Supplier Trust', weight: 0.15, score: 96.3, color: '#D97706' },
      { name: 'Historical', weight: 0.05, score: 97.8, color: '#14C9C9' },
    ],
    alternatives: [{ action: 'Escalate for manual review', confidence: 72.3 }, { action: 'Partial match (80%)', confidence: 45.1 }],
    pastDecisions: [{ id: 'DEC-847', action: 'Auto-matched to PO-2198', outcome: 'Success' }, { id: 'DEC-712', action: 'Auto-matched to PO-2104', outcome: 'Success' }, { id: 'DEC-588', action: 'Auto-matched to PO-1987', outcome: 'Success' }],
  },
  {
    id: 'DEC-002', timestamp: '2026-01-30 09:45:33', agent: 'Risk Agent', invoice: 'INV-9846',
    action: 'Flagged as potential duplicate', confidence: 87.3,
    reasoning: 'Invoice INV-9846 shares 94% similarity with INV-9801 processed 3 days ago. Same supplier, matching amount, overlapping line items. Duplicate probability model returned 87.3% confidence. Escalated for human review per policy.',
    outcome: 'Blocked', humanOverride: false,
    factors: [
      { name: 'Content Similarity', weight: 0.40, score: 94.0, color: '#DC2626' },
      { name: 'Amount Match', weight: 0.25, score: 100.0, color: '#D97706' },
      { name: 'Temporal Proximity', weight: 0.20, score: 78.5, color: '#8E51DA' },
      { name: 'Supplier Pattern', weight: 0.15, score: 65.2, color: '#165DFF' },
    ],
    alternatives: [{ action: 'Allow processing with warning', confidence: 42.1 }, { action: 'Request supplier clarification', confidence: 68.9 }],
    pastDecisions: [{ id: 'DEC-801', action: 'Flagged duplicate INV-9780', outcome: 'Confirmed duplicate' }, { id: 'DEC-623', action: 'Allowed similar INV-9654', outcome: 'Not duplicate' }, { id: 'DEC-445', action: 'Flagged duplicate INV-9412', outcome: 'Confirmed duplicate' }],
  },
  {
    id: 'DEC-003', timestamp: '2026-01-30 09:44:18', agent: 'Classification Agent', invoice: 'INV-9845',
    action: 'Auto-coded GL 6001 (Professional Services)', confidence: 96.1,
    reasoning: 'Invoice from Deloitte Consulting for advisory services. NLP analysis matched 96.1% to GL code 6001 Professional Services. Line item descriptions align with historical coding for consulting engagements. Cost center assigned to CC-450 (Finance).',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'NLP Classification', weight: 0.40, score: 96.8, color: '#8E51DA' },
      { name: 'Supplier Category', weight: 0.25, score: 98.2, color: '#165DFF' },
      { name: 'Line Item Analysis', weight: 0.20, score: 93.5, color: '#23C343' },
      { name: 'Historical Pattern', weight: 0.15, score: 95.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'GL 6002 (IT Consulting)', confidence: 23.8 }, { action: 'Escalate for review', confidence: 15.2 }],
    pastDecisions: [{ id: 'DEC-799', action: 'Coded GL 6001', outcome: 'Correct' }, { id: 'DEC-650', action: 'Coded GL 6001', outcome: 'Correct' }, { id: 'DEC-501', action: 'Coded GL 6002', outcome: 'Corrected to 6001' }],
  },
  {
    id: 'DEC-004', timestamp: '2026-01-30 09:42:55', agent: 'Compliance Agent', invoice: 'INV-9844',
    action: 'Validated UBL 2.1 schema (Belgium)', confidence: 99.9,
    reasoning: 'Full Peppol BIS 3.0 validation passed. Schema validation, Schematron business rules, and Belgian-specific requirements all satisfied. Tax ID cross-referenced with VIES database. E-invoicing format compliant with 2026 B2B mandate requirements.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Schema Valid', weight: 0.30, score: 100.0, color: '#23C343' },
      { name: 'Business Rules', weight: 0.30, score: 100.0, color: '#165DFF' },
      { name: 'Tax ID Check', weight: 0.20, score: 100.0, color: '#8E51DA' },
      { name: 'Format Compliance', weight: 0.20, score: 99.5, color: '#D97706' },
    ],
    alternatives: [{ action: 'Flag for manual review', confidence: 5.1 }],
    pastDecisions: [{ id: 'DEC-793', action: 'Validated UBL (Belgium)', outcome: 'Passed' }, { id: 'DEC-678', action: 'Validated UBL (Belgium)', outcome: 'Passed' }, { id: 'DEC-512', action: 'Rejected invalid schema', outcome: 'Correct rejection' }],
  },
  {
    id: 'DEC-005', timestamp: '2026-01-30 09:41:07', agent: 'Capture Agent', invoice: 'INV-9843',
    action: 'OCR extracted 23 fields', confidence: 99.4,
    reasoning: 'High-resolution PDF processed with multi-model OCR ensemble. All 23 standard fields extracted: vendor name, address, invoice number, date, line items (7), tax amounts, totals. Cross-validation between models showed 99.4% agreement. No manual correction needed.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'OCR Confidence', weight: 0.35, score: 99.7, color: '#165DFF' },
      { name: 'Field Extraction', weight: 0.30, score: 99.2, color: '#23C343' },
      { name: 'Cross-validation', weight: 0.20, score: 99.4, color: '#8E51DA' },
      { name: 'Format Quality', weight: 0.15, score: 98.8, color: '#D97706' },
    ],
    alternatives: [{ action: 'Flag low-confidence fields', confidence: 12.3 }],
    pastDecisions: [{ id: 'DEC-791', action: 'OCR extracted 19 fields', outcome: 'All correct' }, { id: 'DEC-684', action: 'OCR extracted 21 fields', outcome: 'All correct' }, { id: 'DEC-545', action: 'OCR flagged 2 fields', outcome: 'Manual correction applied' }],
  },
  {
    id: 'DEC-006', timestamp: '2026-01-30 09:39:44', agent: 'Approval Agent', invoice: 'INV-9842',
    action: 'Routed to L2 approver (M. Chen)', confidence: 91.2,
    reasoning: 'Invoice amount EUR 25,800 exceeds L1 threshold (EUR 10,000). Department: Engineering. Budget check passed (78% utilized YTD). Routed to Maria Chen based on delegation matrix and current workload balancing. Expected approval SLA: 4 hours.',
    outcome: 'Queued', humanOverride: false,
    factors: [
      { name: 'Amount Threshold', weight: 0.30, score: 100.0, color: '#DC2626' },
      { name: 'Budget Available', weight: 0.25, score: 88.5, color: '#23C343' },
      { name: 'Approver Match', weight: 0.25, score: 92.3, color: '#165DFF' },
      { name: 'Workload Balance', weight: 0.20, score: 82.7, color: '#D97706' },
    ],
    alternatives: [{ action: 'Route to L3 (VP Finance)', confidence: 35.2 }, { action: 'Auto-approve (policy exception)', confidence: 18.7 }],
    pastDecisions: [{ id: 'DEC-788', action: 'Routed to L2 (M. Chen)', outcome: 'Approved in 2.1h' }, { id: 'DEC-672', action: 'Routed to L2 (J. Park)', outcome: 'Approved in 3.5h' }, { id: 'DEC-498', action: 'Routed to L3 (VP)', outcome: 'Approved in 6h' }],
  },
  {
    id: 'DEC-007', timestamp: '2026-01-30 09:38:21', agent: 'Payment Agent', invoice: 'INV-9841',
    action: 'Scheduled payment for 2026-02-14', confidence: 99.8,
    reasoning: 'Payment terms Net-30 from invoice date 2026-01-15. Early payment discount of 2% available if paid by 2026-02-01. Cash flow forecast indicates sufficient liquidity. Optimal payment date calculated: 2026-02-14 balances discount capture vs. cash preservation.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Terms Compliance', weight: 0.30, score: 100.0, color: '#23C343' },
      { name: 'Cash Flow Check', weight: 0.30, score: 99.5, color: '#165DFF' },
      { name: 'Discount Optimization', weight: 0.20, score: 100.0, color: '#D97706' },
      { name: 'Supplier Priority', weight: 0.20, score: 99.2, color: '#8E51DA' },
    ],
    alternatives: [{ action: 'Pay immediately (capture 2% discount)', confidence: 88.4 }, { action: 'Defer to Net-45', confidence: 22.1 }],
    pastDecisions: [{ id: 'DEC-785', action: 'Scheduled Net-30 payment', outcome: 'Paid on time' }, { id: 'DEC-668', action: 'Early payment (2% discount)', outcome: 'Discount captured' }, { id: 'DEC-492', action: 'Scheduled Net-30', outcome: 'Paid on time' }],
  },
  {
    id: 'DEC-008', timestamp: '2026-01-30 09:37:09', agent: 'Communication Agent', invoice: 'INV-9840',
    action: 'Sent payment confirmation to supplier', confidence: 99.5,
    reasoning: 'Payment for INV-9840 (EUR 8,320) confirmed by bank. Automated notification dispatched to accounts@globallogistics.com with remittance advice attached. Communication channel: email (preferred method per supplier profile). Delivery confirmed.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Payment Confirmed', weight: 0.35, score: 100.0, color: '#23C343' },
      { name: 'Contact Valid', weight: 0.25, score: 99.8, color: '#165DFF' },
      { name: 'Template Match', weight: 0.20, score: 98.5, color: '#8E51DA' },
      { name: 'Channel Preference', weight: 0.20, score: 100.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Send via portal notification', confidence: 65.3 }],
    pastDecisions: [{ id: 'DEC-782', action: 'Sent payment confirmation', outcome: 'Acknowledged' }, { id: 'DEC-664', action: 'Sent payment reminder', outcome: 'Acknowledged' }, { id: 'DEC-488', action: 'Sent payment confirmation', outcome: 'Acknowledged' }],
  },
  {
    id: 'DEC-009', timestamp: '2026-01-30 09:35:50', agent: 'Risk Agent', invoice: 'INV-9839',
    action: 'Cleared - No anomalies detected', confidence: 95.8,
    reasoning: 'Standard risk assessment passed. Invoice amount within normal range for supplier. No duplicate indicators. Bank account verified against master data. Fraud scoring model returned low risk (score: 0.04). Sanctions screening clear.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Fraud Score', weight: 0.35, score: 96.0, color: '#23C343' },
      { name: 'Bank Verification', weight: 0.25, score: 100.0, color: '#165DFF' },
      { name: 'Sanctions Check', weight: 0.25, score: 100.0, color: '#8E51DA' },
      { name: 'Pattern Analysis', weight: 0.15, score: 82.5, color: '#D97706' },
    ],
    alternatives: [{ action: 'Enhanced due diligence', confidence: 24.2 }],
    pastDecisions: [{ id: 'DEC-778', action: 'Cleared invoice', outcome: 'No issues' }, { id: 'DEC-660', action: 'Cleared invoice', outcome: 'No issues' }, { id: 'DEC-485', action: 'Flagged for review', outcome: 'False positive' }],
  },
  {
    id: 'DEC-010', timestamp: '2026-01-30 09:34:22', agent: 'Matching Agent', invoice: 'INV-9838',
    action: 'Partial match - Escalated', confidence: 72.4,
    reasoning: 'Two-way match only: invoice matches PO-2235 but goods receipt pending. Amount discrepancy of 3.2% (EUR 340) on line item 3. Supplier has 12% historical discrepancy rate. Escalated for buyer review per threshold policy.',
    outcome: 'Queued', humanOverride: false,
    factors: [
      { name: 'Amount Match', weight: 0.35, score: 68.0, color: '#D97706' },
      { name: 'PO Alignment', weight: 0.25, score: 85.2, color: '#165DFF' },
      { name: 'GR Status', weight: 0.20, score: 0.0, color: '#DC2626' },
      { name: 'Supplier History', weight: 0.15, score: 72.0, color: '#8E51DA' },
      { name: 'Tolerance Check', weight: 0.05, score: 60.0, color: '#14C9C9' },
    ],
    alternatives: [{ action: 'Force match with exception', confidence: 35.6 }, { action: 'Reject and return to supplier', confidence: 28.1 }],
    pastDecisions: [{ id: 'DEC-775', action: 'Escalated partial match', outcome: 'Buyer approved' }, { id: 'DEC-658', action: 'Escalated partial match', outcome: 'Returned to supplier' }, { id: 'DEC-481', action: 'Auto-matched within tolerance', outcome: 'Success' }],
  },
  {
    id: 'DEC-011', timestamp: '2026-01-30 09:32:15', agent: 'Classification Agent', invoice: 'INV-9837',
    action: 'Auto-coded GL 5200 (IT Hardware)', confidence: 93.4,
    reasoning: 'Invoice from Dell Technologies for server equipment. Line items match IT hardware category. Cross-referenced with asset management for capitalization threshold. Amount EUR 45,200 exceeds CAPEX threshold - flagged for asset tagging.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'NLP Classification', weight: 0.40, score: 94.2, color: '#8E51DA' },
      { name: 'Supplier Category', weight: 0.25, score: 99.0, color: '#165DFF' },
      { name: 'Line Item Analysis', weight: 0.20, score: 88.5, color: '#23C343' },
      { name: 'Historical Pattern', weight: 0.15, score: 91.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'GL 5210 (IT Software)', confidence: 18.4 }, { action: 'Escalate for review', confidence: 12.1 }],
    pastDecisions: [{ id: 'DEC-770', action: 'Coded GL 5200', outcome: 'Correct' }, { id: 'DEC-652', action: 'Coded GL 5200', outcome: 'Correct' }, { id: 'DEC-498', action: 'Coded GL 5210', outcome: 'Corrected to 5200' }],
  },
  {
    id: 'DEC-012', timestamp: '2026-01-30 09:30:44', agent: 'Approval Agent', invoice: 'INV-9836',
    action: 'Auto-approved (within L1 threshold)', confidence: 97.2,
    reasoning: 'Invoice amount EUR 3,450 within L1 auto-approval threshold (EUR 10,000). Budget check passed. Supplier whitelisted. No policy exceptions triggered. Approved and forwarded to payment queue.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Amount Threshold', weight: 0.30, score: 100.0, color: '#23C343' },
      { name: 'Budget Available', weight: 0.25, score: 95.0, color: '#165DFF' },
      { name: 'Supplier Status', weight: 0.25, score: 100.0, color: '#8E51DA' },
      { name: 'Policy Check', weight: 0.20, score: 92.5, color: '#D97706' },
    ],
    alternatives: [{ action: 'Route to L1 approver', confidence: 22.8 }],
    pastDecisions: [{ id: 'DEC-768', action: 'Auto-approved', outcome: 'No issues' }, { id: 'DEC-645', action: 'Auto-approved', outcome: 'No issues' }, { id: 'DEC-490', action: 'Auto-approved', outcome: 'No issues' }],
  },
  {
    id: 'DEC-013', timestamp: '2026-01-30 09:28:33', agent: 'Capture Agent', invoice: 'INV-9835',
    action: 'OCR extracted 18 fields (2 low confidence)', confidence: 94.2,
    reasoning: 'Scanned PDF with moderate image quality. 18 of 20 fields extracted with high confidence. Two fields (line item descriptions on page 2) flagged for human verification due to image blur. Overall extraction rate acceptable.',
    outcome: 'Queued', humanOverride: false,
    factors: [
      { name: 'OCR Confidence', weight: 0.35, score: 92.5, color: '#D97706' },
      { name: 'Field Extraction', weight: 0.30, score: 90.0, color: '#165DFF' },
      { name: 'Cross-validation', weight: 0.20, score: 98.0, color: '#8E51DA' },
      { name: 'Format Quality', weight: 0.15, score: 78.5, color: '#DC2626' },
    ],
    alternatives: [{ action: 'Full manual entry', confidence: 8.2 }, { action: 'Re-scan request', confidence: 45.0 }],
    pastDecisions: [{ id: 'DEC-762', action: 'OCR with flag', outcome: 'Manual correction applied' }, { id: 'DEC-640', action: 'OCR full confidence', outcome: 'All correct' }, { id: 'DEC-487', action: 'OCR with flag', outcome: 'Fields confirmed correct' }],
  },
  {
    id: 'DEC-014', timestamp: '2026-01-30 09:26:11', agent: 'Compliance Agent', invoice: 'INV-9834',
    action: 'Rejected - Invalid tax ID format', confidence: 99.2,
    reasoning: 'Polish KSeF validation failed. Tax NIP number format invalid: expected 10 digits, received 9. Invoice cannot be submitted to KSeF system. Returned to supplier with detailed error description and correct format specification.',
    outcome: 'Blocked', humanOverride: false,
    factors: [
      { name: 'Schema Valid', weight: 0.30, score: 100.0, color: '#23C343' },
      { name: 'Business Rules', weight: 0.30, score: 100.0, color: '#165DFF' },
      { name: 'Tax ID Check', weight: 0.20, score: 0.0, color: '#DC2626' },
      { name: 'Format Compliance', weight: 0.20, score: 96.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Allow with manual tax ID correction', confidence: 45.3 }],
    pastDecisions: [{ id: 'DEC-758', action: 'Validated KSeF', outcome: 'Passed' }, { id: 'DEC-636', action: 'Rejected invalid tax ID', outcome: 'Correct rejection' }, { id: 'DEC-484', action: 'Validated KSeF', outcome: 'Passed' }],
  },
  {
    id: 'DEC-015', timestamp: '2026-01-30 09:24:50', agent: 'Payment Agent', invoice: 'INV-9833',
    action: 'Early payment triggered (2% discount)', confidence: 98.1,
    reasoning: 'Early payment discount available: 2/10 Net 30. Cash flow forecast shows surplus. NPV analysis favors early payment: annualized return of 36.5% on discount capture. Payment scheduled for tomorrow to ensure discount window.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Discount Value', weight: 0.30, score: 100.0, color: '#23C343' },
      { name: 'Cash Flow', weight: 0.30, score: 96.2, color: '#165DFF' },
      { name: 'NPV Analysis', weight: 0.25, score: 98.5, color: '#8E51DA' },
      { name: 'Supplier Priority', weight: 0.15, score: 95.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Standard Net-30 payment', confidence: 55.2 }, { action: 'Negotiate extended terms', confidence: 12.8 }],
    pastDecisions: [{ id: 'DEC-755', action: 'Early payment (discount)', outcome: 'Discount captured' }, { id: 'DEC-632', action: 'Standard payment', outcome: 'Paid on time' }, { id: 'DEC-480', action: 'Early payment (discount)', outcome: 'Discount captured' }],
  },
  {
    id: 'DEC-016', timestamp: '2026-01-30 09:22:37', agent: 'Risk Agent', invoice: 'INV-9832',
    action: 'Bank account change flagged', confidence: 82.6,
    reasoning: 'Supplier GlobalTech submitted invoice with new bank account details. Account change detected vs. master data. Flagged for treasury verification per fraud prevention policy. Previous account used for 23 months without change.',
    outcome: 'Blocked', humanOverride: false,
    factors: [
      { name: 'Account Change', weight: 0.40, score: 100.0, color: '#DC2626' },
      { name: 'Supplier History', weight: 0.25, score: 92.0, color: '#D97706' },
      { name: 'Verification Status', weight: 0.20, score: 0.0, color: '#DC2626' },
      { name: 'Risk Score', weight: 0.15, score: 75.0, color: '#8E51DA' },
    ],
    alternatives: [{ action: 'Allow with callback verification', confidence: 55.3 }, { action: 'Process to old account', confidence: 40.1 }],
    pastDecisions: [{ id: 'DEC-748', action: 'Flagged bank change', outcome: 'Legitimate change' }, { id: 'DEC-625', action: 'Flagged bank change', outcome: 'Fraud attempt prevented' }, { id: 'DEC-472', action: 'Cleared account', outcome: 'No issues' }],
  },
  {
    id: 'DEC-017', timestamp: '2026-01-30 09:20:18', agent: 'Communication Agent', invoice: 'INV-9831',
    action: 'Sent dispute notification to supplier', confidence: 97.8,
    reasoning: 'Invoice INV-9831 disputed by buyer: quantity mismatch on line 4. Automated dispute notification generated with supporting documentation (PO and GR comparison). Sent to disputes@acmewidgets.com. Response deadline set: 5 business days.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Dispute Valid', weight: 0.30, score: 98.0, color: '#D97706' },
      { name: 'Contact Valid', weight: 0.25, score: 100.0, color: '#165DFF' },
      { name: 'Documentation', weight: 0.25, score: 96.5, color: '#23C343' },
      { name: 'Priority Level', weight: 0.20, score: 95.0, color: '#8E51DA' },
    ],
    alternatives: [{ action: 'Escalate internally first', confidence: 32.4 }],
    pastDecisions: [{ id: 'DEC-745', action: 'Sent dispute notification', outcome: 'Resolved in 3 days' }, { id: 'DEC-620', action: 'Sent dispute notification', outcome: 'Credit note received' }, { id: 'DEC-468', action: 'Escalated internally', outcome: 'Resolved' }],
  },
  {
    id: 'DEC-018', timestamp: '2026-01-30 09:18:02', agent: 'Matching Agent', invoice: 'INV-9830',
    action: 'Auto-matched to PO-2233 + PO-2234', confidence: 94.5,
    reasoning: 'Consolidated invoice matching two purchase orders. Amount split: EUR 15,200 to PO-2233, EUR 8,400 to PO-2234. Both POs from same project. Goods receipts confirmed. Multi-PO matching algorithm applied successfully.',
    outcome: 'Executed', humanOverride: true,
    factors: [
      { name: 'Amount Match', weight: 0.35, score: 96.0, color: '#23C343' },
      { name: 'Multi-PO Logic', weight: 0.25, score: 94.2, color: '#165DFF' },
      { name: 'GR Confirmation', weight: 0.20, score: 100.0, color: '#8E51DA' },
      { name: 'Project Link', weight: 0.15, score: 88.0, color: '#D97706' },
      { name: 'Historical', weight: 0.05, score: 85.0, color: '#14C9C9' },
    ],
    alternatives: [{ action: 'Match to PO-2233 only', confidence: 62.1 }, { action: 'Escalate for buyer review', confidence: 48.5 }],
    pastDecisions: [{ id: 'DEC-742', action: 'Multi-PO match', outcome: 'Success' }, { id: 'DEC-618', action: 'Single PO match', outcome: 'Success' }, { id: 'DEC-465', action: 'Multi-PO match', outcome: 'Manual adjustment needed' }],
  },
  {
    id: 'DEC-019', timestamp: '2026-01-30 09:15:44', agent: 'Classification Agent', invoice: 'INV-9829',
    action: 'Auto-coded GL 4100 (Raw Materials)', confidence: 91.7,
    reasoning: 'Invoice from SteelWorks Inc for steel plates. Line items match raw materials category. Quantity and unit prices consistent with commodity market rates. Cost center assigned to CC-310 (Manufacturing).',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'NLP Classification', weight: 0.40, score: 92.0, color: '#8E51DA' },
      { name: 'Supplier Category', weight: 0.25, score: 97.5, color: '#165DFF' },
      { name: 'Line Item Analysis', weight: 0.20, score: 88.0, color: '#23C343' },
      { name: 'Historical Pattern', weight: 0.15, score: 87.5, color: '#D97706' },
    ],
    alternatives: [{ action: 'GL 4110 (Components)', confidence: 28.3 }, { action: 'Escalate for review', confidence: 10.5 }],
    pastDecisions: [{ id: 'DEC-738', action: 'Coded GL 4100', outcome: 'Correct' }, { id: 'DEC-612', action: 'Coded GL 4100', outcome: 'Correct' }, { id: 'DEC-460', action: 'Coded GL 4100', outcome: 'Correct' }],
  },
  {
    id: 'DEC-020', timestamp: '2026-01-30 09:13:28', agent: 'Approval Agent', invoice: 'INV-9828',
    action: 'Auto-approved (recurring contract)', confidence: 99.1,
    reasoning: 'Recurring monthly invoice from CloudHost Ltd. Amount EUR 2,100 matches contract terms exactly. Auto-approval enabled for verified recurring invoices with <= 1% variance. 18th consecutive auto-approval for this contract.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Contract Match', weight: 0.35, score: 100.0, color: '#23C343' },
      { name: 'Amount Variance', weight: 0.25, score: 100.0, color: '#165DFF' },
      { name: 'Recurrence Pattern', weight: 0.25, score: 100.0, color: '#8E51DA' },
      { name: 'Budget Check', weight: 0.15, score: 95.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Route for review', confidence: 8.5 }],
    pastDecisions: [{ id: 'DEC-735', action: 'Auto-approved recurring', outcome: 'No issues' }, { id: 'DEC-608', action: 'Auto-approved recurring', outcome: 'No issues' }, { id: 'DEC-455', action: 'Auto-approved recurring', outcome: 'No issues' }],
  },
  {
    id: 'DEC-021', timestamp: '2026-01-30 09:11:05', agent: 'Capture Agent', invoice: 'INV-9827',
    action: 'E-invoice parsed (Factur-X)', confidence: 99.8,
    reasoning: 'Factur-X hybrid invoice received. XML payload extracted from PDF/A-3 container. All structured data parsed without OCR required. 25 fields extracted from XML. PDF visual layer matches XML data. Zero discrepancies.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'XML Extraction', weight: 0.40, score: 100.0, color: '#23C343' },
      { name: 'PDF/A Compliance', weight: 0.25, score: 99.5, color: '#165DFF' },
      { name: 'Data Consistency', weight: 0.20, score: 100.0, color: '#8E51DA' },
      { name: 'Field Completeness', weight: 0.15, score: 99.5, color: '#D97706' },
    ],
    alternatives: [{ action: 'OCR fallback extraction', confidence: 15.2 }],
    pastDecisions: [{ id: 'DEC-730', action: 'Parsed Factur-X', outcome: 'All correct' }, { id: 'DEC-602', action: 'Parsed Factur-X', outcome: 'All correct' }, { id: 'DEC-450', action: 'Parsed UBL XML', outcome: 'All correct' }],
  },
  {
    id: 'DEC-022', timestamp: '2026-01-30 09:08:42', agent: 'Risk Agent', invoice: 'INV-9826',
    action: 'Cleared - Low risk score', confidence: 97.3,
    reasoning: 'Standard risk assessment: all checks passed. Supplier established (5+ years). Invoice pattern consistent with historical. No sanctions hits. Bank account verified. Fraud model score: 0.02 (very low).',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Fraud Score', weight: 0.35, score: 98.0, color: '#23C343' },
      { name: 'Supplier Trust', weight: 0.25, score: 100.0, color: '#165DFF' },
      { name: 'Sanctions Clear', weight: 0.25, score: 100.0, color: '#8E51DA' },
      { name: 'Pattern Match', weight: 0.15, score: 88.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Enhanced screening', confidence: 12.7 }],
    pastDecisions: [{ id: 'DEC-725', action: 'Cleared invoice', outcome: 'No issues' }, { id: 'DEC-598', action: 'Cleared invoice', outcome: 'No issues' }, { id: 'DEC-445', action: 'Cleared invoice', outcome: 'No issues' }],
  },
  {
    id: 'DEC-023', timestamp: '2026-01-30 09:06:18', agent: 'Payment Agent', invoice: 'INV-9825',
    action: 'Payment batch #445 executed (12 invoices)', confidence: 99.6,
    reasoning: 'Batch payment execution: 12 approved invoices totaling EUR 187,340. All bank details verified. SEPA SCT file generated. Dual authorization obtained. Batch submitted to banking portal. Expected settlement: T+1.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'All Approved', weight: 0.30, score: 100.0, color: '#23C343' },
      { name: 'Bank Verified', weight: 0.25, score: 100.0, color: '#165DFF' },
      { name: 'SEPA Compliant', weight: 0.25, score: 100.0, color: '#8E51DA' },
      { name: 'Dual Auth', weight: 0.20, score: 98.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Split into smaller batches', confidence: 22.1 }],
    pastDecisions: [{ id: 'DEC-722', action: 'Batch payment (10)', outcome: 'All settled' }, { id: 'DEC-595', action: 'Batch payment (15)', outcome: 'All settled' }, { id: 'DEC-442', action: 'Batch payment (8)', outcome: 'All settled' }],
  },
  {
    id: 'DEC-024', timestamp: '2026-01-30 09:04:01', agent: 'Compliance Agent', invoice: 'INV-9824',
    action: 'Validated FatturaPA (Italy SDI)', confidence: 99.5,
    reasoning: 'Italian SDI validation complete. FatturaPA XML structure valid. Progressive invoice number verified. Codice Destinatario confirmed. Tax calculations verified against Italian VAT rates. Ready for SDI submission.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'XML Structure', weight: 0.30, score: 100.0, color: '#23C343' },
      { name: 'Tax Calculation', weight: 0.30, score: 99.0, color: '#165DFF' },
      { name: 'SDI Requirements', weight: 0.25, score: 100.0, color: '#8E51DA' },
      { name: 'Progressive #', weight: 0.15, score: 99.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Manual tax review', confidence: 8.5 }],
    pastDecisions: [{ id: 'DEC-718', action: 'Validated FatturaPA', outcome: 'SDI accepted' }, { id: 'DEC-590', action: 'Validated FatturaPA', outcome: 'SDI accepted' }, { id: 'DEC-438', action: 'Rejected FatturaPA', outcome: 'Correct rejection' }],
  },
  {
    id: 'DEC-025', timestamp: '2026-01-30 09:01:44', agent: 'Matching Agent', invoice: 'INV-9823',
    action: 'Service invoice - No PO match required', confidence: 88.9,
    reasoning: 'Non-PO invoice identified. Supplier category: Professional Services. Amount EUR 5,600 within non-PO tolerance for this category. Coded to correct GL account. Routed directly to approval workflow.',
    outcome: 'Executed', humanOverride: true,
    factors: [
      { name: 'Category Match', weight: 0.35, score: 92.0, color: '#23C343' },
      { name: 'Amount Tolerance', weight: 0.25, score: 88.0, color: '#165DFF' },
      { name: 'Supplier Category', weight: 0.25, score: 95.0, color: '#8E51DA' },
      { name: 'Historical', weight: 0.15, score: 75.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Require retroactive PO', confidence: 45.2 }, { action: 'Reject - PO required', confidence: 30.8 }],
    pastDecisions: [{ id: 'DEC-715', action: 'Non-PO approved', outcome: 'Processed' }, { id: 'DEC-588', action: 'Non-PO escalated', outcome: 'Approved' }, { id: 'DEC-435', action: 'Non-PO approved', outcome: 'Processed' }],
  },
  {
    id: 'DEC-026', timestamp: '2026-01-30 08:58:22', agent: 'Classification Agent', invoice: 'INV-9822',
    action: 'Auto-coded GL 7100 (Travel & Entertainment)', confidence: 89.3,
    reasoning: 'Invoice from Hilton Hotels for conference accommodation. Expense policy check: within per-diem limits. Line items match T&E category. Event verified against approved travel requests. VAT reclaim flagged for applicable items.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'NLP Classification', weight: 0.40, score: 90.5, color: '#8E51DA' },
      { name: 'Policy Compliance', weight: 0.25, score: 92.0, color: '#165DFF' },
      { name: 'Travel Request', weight: 0.20, score: 85.0, color: '#23C343' },
      { name: 'Historical Pattern', weight: 0.15, score: 88.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'GL 7110 (Conference Costs)', confidence: 38.5 }, { action: 'Escalate for policy review', confidence: 15.2 }],
    pastDecisions: [{ id: 'DEC-710', action: 'Coded GL 7100', outcome: 'Correct' }, { id: 'DEC-582', action: 'Coded GL 7100', outcome: 'Correct' }, { id: 'DEC-430', action: 'Coded GL 7110', outcome: 'Corrected to 7100' }],
  },
  {
    id: 'DEC-027', timestamp: '2026-01-30 08:55:10', agent: 'Approval Agent', invoice: 'INV-9821',
    action: 'Routed to L3 approver (VP Finance)', confidence: 85.4,
    reasoning: 'Invoice amount EUR 125,000 exceeds L2 threshold (EUR 50,000). Capital expenditure category. Budget committee pre-approval reference found. Routed to VP Finance per delegation of authority matrix. High priority flag set.',
    outcome: 'Queued', humanOverride: false,
    factors: [
      { name: 'Amount Threshold', weight: 0.30, score: 100.0, color: '#DC2626' },
      { name: 'CAPEX Category', weight: 0.25, score: 90.0, color: '#D97706' },
      { name: 'Budget Pre-approval', weight: 0.25, score: 88.0, color: '#165DFF' },
      { name: 'Delegation Matrix', weight: 0.20, score: 60.0, color: '#8E51DA' },
    ],
    alternatives: [{ action: 'Route to CFO', confidence: 42.1 }, { action: 'Split into sub-thresholds', confidence: 15.0 }],
    pastDecisions: [{ id: 'DEC-705', action: 'Routed to VP Finance', outcome: 'Approved in 8h' }, { id: 'DEC-578', action: 'Routed to CFO', outcome: 'Approved in 24h' }, { id: 'DEC-425', action: 'Routed to VP Finance', outcome: 'Approved in 6h' }],
  },
  {
    id: 'DEC-028', timestamp: '2026-01-30 08:52:55', agent: 'Communication Agent', invoice: 'INV-9820',
    action: 'Sent monthly statement to supplier', confidence: 98.2,
    reasoning: 'End-of-month statement generated for MegaCorp Supplies. 14 invoices processed, 12 paid, 2 pending approval. Statement includes payment history, outstanding balances, and projected payment dates. Sent to ar@megacorp.com.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Data Accuracy', weight: 0.30, score: 99.0, color: '#23C343' },
      { name: 'Contact Valid', weight: 0.25, score: 100.0, color: '#165DFF' },
      { name: 'Template Match', weight: 0.25, score: 96.0, color: '#8E51DA' },
      { name: 'Timing', weight: 0.20, score: 97.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Portal notification only', confidence: 55.0 }],
    pastDecisions: [{ id: 'DEC-700', action: 'Sent monthly statement', outcome: 'Acknowledged' }, { id: 'DEC-572', action: 'Sent monthly statement', outcome: 'Acknowledged' }, { id: 'DEC-420', action: 'Sent monthly statement', outcome: 'Acknowledged' }],
  },
  {
    id: 'DEC-029', timestamp: '2026-01-30 08:50:30', agent: 'Capture Agent', invoice: 'INV-9819',
    action: 'Email attachment extracted and queued', confidence: 96.8,
    reasoning: 'Incoming email from vendor detected with PDF attachment. Invoice identified via subject line parsing and attachment analysis. PDF extracted, validated as invoice (not statement/quote). Queued for OCR processing.',
    outcome: 'Executed', humanOverride: false,
    factors: [
      { name: 'Email Parsing', weight: 0.30, score: 98.0, color: '#165DFF' },
      { name: 'Doc Classification', weight: 0.30, score: 95.5, color: '#8E51DA' },
      { name: 'Attachment Valid', weight: 0.25, score: 100.0, color: '#23C343' },
      { name: 'Sender Verified', weight: 0.15, score: 90.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Flag for manual review', confidence: 18.5 }, { action: 'Reject - unverified sender', confidence: 8.2 }],
    pastDecisions: [{ id: 'DEC-695', action: 'Email extraction', outcome: 'Correct doc' }, { id: 'DEC-568', action: 'Email extraction', outcome: 'Correct doc' }, { id: 'DEC-415', action: 'Email rejected', outcome: 'Was a quote, not invoice' }],
  },
  {
    id: 'DEC-030', timestamp: '2026-01-30 08:48:12', agent: 'Advisory Agent', invoice: 'INV-9818',
    action: 'Cash flow optimization recommendation', confidence: 78.5,
    reasoning: 'Advisory analysis for Q1 payment scheduling. Identified EUR 45,000 in available early payment discounts across 8 suppliers. Recommended payment acceleration for top 3 suppliers based on ROI analysis. Net benefit: EUR 2,340 annualized.',
    outcome: 'Queued', humanOverride: false,
    factors: [
      { name: 'Discount Analysis', weight: 0.35, score: 85.0, color: '#23C343' },
      { name: 'Cash Flow Impact', weight: 0.30, score: 72.0, color: '#165DFF' },
      { name: 'ROI Calculation', weight: 0.20, score: 80.0, color: '#8E51DA' },
      { name: 'Risk Assessment', weight: 0.15, score: 75.0, color: '#D97706' },
    ],
    alternatives: [{ action: 'Standard payment terms', confidence: 65.0 }, { action: 'Negotiate extended terms', confidence: 42.3 }],
    pastDecisions: [{ id: 'DEC-690', action: 'Cash flow advisory', outcome: 'Implemented - saved EUR 1,800' }, { id: 'DEC-560', action: 'Payment optimization', outcome: 'Partially implemented' }, { id: 'DEC-410', action: 'Discount advisory', outcome: 'Implemented - saved EUR 2,100' }],
  },
];

/* ═══════════════════════════════════════════════════════════════
   Mock Data - Agent Configuration
   ═══════════════════════════════════════════════════════════════ */

interface AgentConfig {
  name: string;
  icon: string;
  iconBg: string;
  confidenceThreshold: number;
  autoExecute: boolean;
  escalationRule: string;
  maxQueueDepth: number;
  retryCount: number;
}

const initialConfigs: AgentConfig[] = [
  { name: 'Capture Agent', icon: '\uD83D\uDCF7', iconBg: 'rgba(59,130,246,0.15)', confidenceThreshold: 90, autoExecute: true, escalationRule: 'Low Confidence', maxQueueDepth: 100, retryCount: 3 },
  { name: 'Classification Agent', icon: '\uD83C\uDFF7\uFE0F', iconBg: 'rgba(139,92,246,0.15)', confidenceThreshold: 85, autoExecute: true, escalationRule: 'Low Confidence', maxQueueDepth: 80, retryCount: 2 },
  { name: 'Compliance Agent', icon: '\uD83D\uDEE1\uFE0F', iconBg: 'rgba(6,182,212,0.15)', confidenceThreshold: 95, autoExecute: true, escalationRule: 'Never', maxQueueDepth: 60, retryCount: 3 },
  { name: 'Matching Agent', icon: '\uD83D\uDD17', iconBg: 'rgba(245,158,11,0.15)', confidenceThreshold: 88, autoExecute: true, escalationRule: 'Low Confidence', maxQueueDepth: 120, retryCount: 2 },
  { name: 'Risk Agent', icon: '\uD83D\uDEA8', iconBg: 'rgba(239,68,68,0.15)', confidenceThreshold: 80, autoExecute: false, escalationRule: 'Always', maxQueueDepth: 50, retryCount: 1 },
  { name: 'Approval Agent', icon: '\u2705', iconBg: 'rgba(16,185,129,0.15)', confidenceThreshold: 92, autoExecute: true, escalationRule: 'Low Confidence', maxQueueDepth: 75, retryCount: 2 },
  { name: 'Payment Agent', icon: '\uD83D\uDCB3', iconBg: 'rgba(16,185,129,0.15)', confidenceThreshold: 98, autoExecute: true, escalationRule: 'Never', maxQueueDepth: 40, retryCount: 3 },
  { name: 'Communication Agent', icon: '\uD83D\uDCE8', iconBg: 'rgba(139,92,246,0.15)', confidenceThreshold: 85, autoExecute: true, escalationRule: 'Never', maxQueueDepth: 200, retryCount: 5 },
  { name: 'Advisory Agent', icon: '\uD83E\uDDE0', iconBg: 'rgba(245,158,11,0.15)', confidenceThreshold: 75, autoExecute: false, escalationRule: 'Always', maxQueueDepth: 30, retryCount: 2 },
];

/* ═══════════════════════════════════════════════════════════════
   Mock Data - Audit
   ═══════════════════════════════════════════════════════════════ */

const agentAccuracyData = [
  { agent: 'Capture Agent', decisions: 3847, accuracy: 99.1, overrides: 12 },
  { agent: 'Classification Agent', decisions: 3721, accuracy: 97.8, overrides: 34 },
  { agent: 'Compliance Agent', decisions: 3615, accuracy: 99.7, overrides: 5 },
  { agent: 'Matching Agent', decisions: 3502, accuracy: 96.3, overrides: 67 },
  { agent: 'Risk Agent', decisions: 3488, accuracy: 98.2, overrides: 28 },
  { agent: 'Approval Agent', decisions: 3201, accuracy: 97.5, overrides: 41 },
  { agent: 'Payment Agent', decisions: 2894, accuracy: 99.9, overrides: 2 },
  { agent: 'Communication Agent', decisions: 2756, accuracy: 98.6, overrides: 8 },
  { agent: 'Advisory Agent', decisions: 1542, accuracy: 94.1, overrides: 89 },
];

const errorLog = [
  { time: '09:47', agent: 'Advisory', message: 'Model timeout processing complex multi-currency advisory for INV-9821' },
  { time: '09:32', agent: 'Advisory', message: 'Insufficient context for cash flow projection - missing Q4 actuals' },
  { time: '09:18', agent: 'Matching', message: 'PO-2231 not found in ERP system - sync delay detected' },
  { time: '09:05', agent: 'Advisory', message: 'Rate limit exceeded on external market data API' },
  { time: '08:52', agent: 'Capture', message: 'OCR engine returned low confidence (72%) on handwritten invoice' },
  { time: '08:41', agent: 'Compliance', message: 'KSeF authentication token refresh failed - retrying' },
  { time: '08:33', agent: 'Advisory', message: 'Working capital model convergence failure after 100 iterations' },
  { time: '08:22', agent: 'Communication', message: 'SMTP connection timeout to supplier smtp.oldco.com' },
  { time: '08:11', agent: 'Risk', message: 'Sanctions database update in progress - using cached version' },
  { time: '08:02', agent: 'Matching', message: 'Fuzzy matching threshold exceeded for supplier name variation' },
  { time: '07:48', agent: 'Advisory', message: 'GPT-4 context window exceeded for large supplier portfolio analysis' },
  { time: '07:35', agent: 'Classification', message: 'Ambiguous GL code mapping for mixed-category invoice' },
  { time: '07:22', agent: 'Payment', message: 'Bank API rate limit reached - batch delayed by 5 minutes' },
  { time: '07:10', agent: 'Capture', message: 'PDF corruption detected in email attachment from vendor' },
  { time: '06:55', agent: 'Advisory', message: 'Discount optimization model produced outlier recommendation' },
  { time: '06:42', agent: 'Compliance', message: 'Belgium schema v3.2 validation rule mismatch - fallback to v3.1' },
  { time: '06:30', agent: 'Matching', message: 'Goods receipt GR-1098 has quantity discrepancy exceeding tolerance' },
  { time: '06:18', agent: 'Risk', message: 'External fraud scoring service returned HTTP 503' },
  { time: '06:05', agent: 'Advisory', message: 'Benchmark data unavailable for new supplier category' },
  { time: '05:52', agent: 'Communication', message: 'Email bounce: invalid address notifications@supplier-defunct.com' },
];

/* ═══════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════ */

type TabId = 'overview' | 'agents' | 'decisions' | 'configuration' | 'audit';

export default function AgentStudioPage() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [agents, setAgents] = useState<AgentHealth[]>(initialAgents);
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null);
  const [configs, setConfigs] = useState<AgentConfig[]>(initialConfigs);

  // Decision filters
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterOutcome, setFilterOutcome] = useState('all');
  const [filterConfMin, setFilterConfMin] = useState('0');

  // Global settings
  const [pipelineMode, setPipelineMode] = useState('sequential');
  const [hitlThreshold, setHitlThreshold] = useState(85);
  const [autoLearning, setAutoLearning] = useState(true);
  const [feedbackIntegration, setFeedbackIntegration] = useState(true);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'agents', label: 'Agents' },
    { id: 'decisions', label: 'Decisions' },
    { id: 'configuration', label: 'Configuration' },
    { id: 'audit', label: 'Audit' },
  ];

  const toggleAgent = (index: number) => {
    setAgents(prev => prev.map((a, i) => i === index ? { ...a, enabled: !a.enabled } : a));
  };

  const updateConfig = (index: number, field: keyof AgentConfig, value: AgentConfig[keyof AgentConfig]) => {
    setConfigs(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const filteredDecisions = decisions.filter(d => {
    if (filterAgent !== 'all' && d.agent !== filterAgent) return false;
    if (filterOutcome !== 'all' && d.outcome !== filterOutcome) return false;
    if (d.confidence < Number(filterConfMin)) return false;
    return true;
  });

  const getConfidenceColor = (conf: number) => {
    if (conf >= 95) return '#23C343';
    if (conf >= 85) return '#165DFF';
    if (conf >= 70) return '#D97706';
    return '#DC2626';
  };

  /* ─── Render Pipeline ─────────────────────────────────────── */

  const renderPipeline = () => (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        Processing Pipeline
        <span className={styles.sectionTitleBadge}>8 stages</span>
      </div>
      <div className={styles.pipeline}>
        {pipelineStages.map((stage, i) => (
          <div key={stage.name} style={{ display: 'flex', alignItems: 'stretch' }}>
            <div className={styles.pipelineStage}>
              <div className={styles.pipelineStageHeader}>
                <span className={styles.pipelineStageName}>{stage.name}</span>
                <span className={`${styles.pipelineStatusDot} ${
                  stage.status === 'active' ? styles.pipelineStatusActive :
                  stage.status === 'idle' ? styles.pipelineStatusIdle :
                  styles.pipelineStatusError
                }`} />
              </div>
              <div className={styles.pipelineMetric}>
                <span className={styles.pipelineMetricLabel}>Agent</span>
                <span className={styles.pipelineMetricValue}>{stage.agent.replace(' Agent', '')}</span>
              </div>
              <div className={styles.pipelineMetric}>
                <span className={styles.pipelineMetricLabel}>Docs Today</span>
                <span className={styles.pipelineMetricValue}>{stage.docsToday}</span>
              </div>
              <div className={styles.pipelineMetric}>
                <span className={styles.pipelineMetricLabel}>Accuracy</span>
                <span className={styles.pipelineMetricValue}>{stage.accuracy}%</span>
              </div>
              <div className={styles.pipelineMetric}>
                <span className={styles.pipelineMetricLabel}>Avg Latency</span>
                <span className={styles.pipelineMetricValue}>{stage.latency}</span>
              </div>
            </div>
            {i < pipelineStages.length - 1 && (
              <div className={styles.pipelineArrow}>&rarr;</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  /* ─── Render Overview Tab ──────────────────────────────────── */

  const renderOverview = () => (
    <>
      {/* Real-time metrics */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('agentStudio.tasksToday')}</div>
          <div className={styles.statValue}>847</div>
          <div className={`${styles.statChange} ${styles.statChangeUp}`}>+12.3% vs yesterday</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Autonomous Rate</div>
          <div className={styles.statValue} style={{ color: '#23C343' }}>94.9%</div>
          <div className={`${styles.statChange} ${styles.statChangeUp}`}>+1.2% this week</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('agentStudio.avgAccuracy')}</div>
          <div className={styles.statValue}>4.2s</div>
          <div className={`${styles.statChange} ${styles.statChangeDown}`}>+0.3s vs baseline</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>{t('agentStudio.activeAgents')}</div>
          <div className={styles.statValue}>8/9</div>
          <div className={`${styles.statChange} ${styles.statChangeDown}`}>1 agent in error state</div>
        </div>
      </div>

      {/* ── Business Impact Banner ──────────────────────────────── */}
      <div className={styles.impactBanner}>
        <div className={styles.impactBannerHeader}>
          <div className={styles.impactBannerTitleRow}>
            <span className={styles.impactBannerIcon}>&#x1F680;</span>
            <div className={styles.impactBannerTitleBlock}>
              <span className={styles.impactBannerTitle}>Agentic AI: The Retention Engine</span>
              <span className={styles.impactBannerSubtitle}>Bet 3 &mdash; Touchless processing autonomy drives customer retention and NPS</span>
            </div>
          </div>
          <div className={styles.impactBannerIce}>
            <div>
              <div className={styles.impactBannerIceLabel}>ICE Score</div>
              <div className={styles.impactBannerIceValue}>21</div>
            </div>
            <div className={styles.impactBannerIceBreakdown}>Impact 10 | Confidence 6 | Ease 5</div>
          </div>
        </div>

        <div className={styles.impactCohorts}>
          <div className={`${styles.impactCohortCard} ${styles.impactCohortCardHigh}`}>
            <div className={styles.impactCohortLabel}>High Autonomy Cohort</div>
            <div className={styles.impactCohortThreshold}>&gt;90% Touchless Processing</div>
            <div className={`${styles.impactCohortRenewal} ${styles.impactCohortRenewalHigh}`}>97%</div>
            <div className={styles.impactCohortRenewalLabel}>Renewal Rate</div>
          </div>

          <div className={styles.impactVs}>vs</div>

          <div className={`${styles.impactCohortCard} ${styles.impactCohortCardLow}`}>
            <div className={styles.impactCohortLabel}>Low Autonomy Cohort</div>
            <div className={styles.impactCohortThreshold}>&lt;70% Touchless Processing</div>
            <div className={`${styles.impactCohortRenewal} ${styles.impactCohortRenewalLow}`}>82%</div>
            <div className={styles.impactCohortRenewalLabel}>Renewal Rate</div>
          </div>

          <div className={styles.impactNpsCard}>
            <div className={styles.impactNpsDelta}>+28</div>
            <div className={styles.impactNpsLabel}>NPS Delta Between Cohorts</div>
          </div>
        </div>

        <div className={styles.impactCurrentRate}>
          <span className={styles.impactCurrentRateLabel}>Current Touchless Rate:</span>
          <span className={styles.impactCurrentRateValue}>94.9%</span>
          <span className={styles.impactCurrentRateBadge}>In &gt;90% High-Retention Zone</span>
        </div>
      </div>

      {/* ── Customer Retention Impact Dashboard ─────────────────── */}
      <div className={styles.retentionDashboard}>
        <div className={styles.retentionDashboardTitle}>
          Customer Retention Impact Dashboard
          <span className={styles.retentionDashboardBadge}>All Targets Met</span>
        </div>
        <div className={styles.retentionGrid}>
          <div className={styles.retentionCard}>
            <div className={styles.retentionCardLabel}>
              <span className={styles.retentionCardIcon}>&#x1F4C8;</span> Touchless Processing Rate
            </div>
            <div className={styles.retentionCardValue} style={{ color: '#23C343' }}>94.9%</div>
            <div className={`${styles.retentionCardTrend} ${styles.retentionCardTrendUp}`}>
              &#x25B2; 6-month trend: 88.2% &rarr; 94.9% (+6.7pp)
            </div>
            <div className={styles.retentionTrendMini}>
              {[88.2, 89.5, 90.8, 92.1, 93.4, 94.9].map((v, i) => (
                <div
                  key={i}
                  className={styles.retentionTrendBar}
                  style={{
                    height: `${((v - 85) / 15) * 24}px`,
                    background: v >= 90 ? '#23C343' : '#FF9A2E',
                  }}
                />
              ))}
            </div>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionCardLabel}>
              <span className={styles.retentionCardIcon}>&#x1F91D;</span> Customer Renewal Rate
            </div>
            <div className={styles.retentionCardValue} style={{ color: '#23C343' }}>97%</div>
            <div className={`${styles.retentionCardTrend} ${styles.retentionCardTrendUp}`}>
              &#x25B2; Target achieved (benchmark: 82%)
            </div>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionCardLabel}>
              <span className={styles.retentionCardIcon}>&#x2B50;</span> NPS Score
            </div>
            <div className={styles.retentionCardValue} style={{ color: '#165DFF' }}>72</div>
            <div className={`${styles.retentionCardTrend} ${styles.retentionCardTrendUp}`}>
              &#x25B2; +28 vs baseline of 44
            </div>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionCardLabel}>
              <span className={styles.retentionCardIcon}>&#x23F1;&#xFE0F;</span> Avg Cycle Time
            </div>
            <div className={styles.retentionCardValue}>2.1 <span style={{ fontSize: '0.85rem', color: '#4E5969' }}>days</span></div>
            <div className={`${styles.retentionCardTrend} ${styles.retentionCardTrendUp}`}>
              &#x25BC; -0.3d this week
            </div>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionCardLabel}>
              <span className={styles.retentionCardIcon}>&#x1F4B0;</span> Cost per Invoice
            </div>
            <div className={styles.retentionCardValue} style={{ color: '#23C343' }}>$1.24</div>
            <div className={`${styles.retentionCardTrend} ${styles.retentionCardTrendUp}`}>
              &#x25BC; vs $8.40 manual benchmark (-85%)
            </div>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionCardLabel}>
              <span className={styles.retentionCardIcon}>&#x1F4BC;</span> Annual Labor Savings
            </div>
            <div className={styles.retentionCardValue} style={{ color: '#8E51DA' }}>$2.4M</div>
            <div className={`${styles.retentionCardTrend} ${styles.retentionCardTrendNeutral}`}>
              Equivalent to 28 FTEs redeployed
            </div>
          </div>
        </div>
      </div>

      {/* ── Touchless Rate by Customer Segment ──────────────────── */}
      <div className={styles.segmentSection}>
        <div className={styles.segmentSectionTitle}>
          Touchless Rate by Customer Segment
          <span className={styles.segmentSectionBadge}>5 Segments</span>
        </div>
        <table className={styles.segmentTable}>
          <thead>
            <tr>
              <th>Segment</th>
              <th>Touchless Rate</th>
              <th>Renewal Rate</th>
              <th>NPS</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Enterprise', sub: '>$1M AP volume', touchless: 96.2, renewal: '98%', nps: 76, color: '#23C343', status: 'healthy' },
              { name: 'Mid-Market', sub: '$250K\u2013$1M', touchless: 94.1, renewal: '97%', nps: 71, color: '#23C343', status: 'healthy' },
              { name: 'SMB', sub: '<$250K', touchless: 91.8, renewal: '94%', nps: 68, color: '#165DFF', status: 'healthy' },
              { name: 'New Customers', sub: '<6 months', touchless: 87.4, renewal: 'N/A', nps: 62, color: '#FF9A2E', status: 'onboarding' },
              { name: 'At-Risk', sub: '<70% touchless', touchless: 64.2, renewal: '82%', nps: 44, color: '#F76560', status: 'at-risk' },
            ].map((seg) => (
              <tr key={seg.name} className={seg.status === 'at-risk' ? styles.segmentRowAtRisk : undefined}>
                <td>
                  <div className={styles.segmentNameCell}>
                    <span className={styles.segmentDot} style={{ background: seg.color }} />
                    <span>
                      <span className={styles.segmentNameLabel}>{seg.name}</span>
                      <span className={styles.segmentNameSub}>{seg.sub}</span>
                    </span>
                  </div>
                </td>
                <td>
                  <div className={styles.segmentTouchlessCell}>
                    <span className={styles.segmentTouchlessValue} style={{ color: seg.color }}>{seg.touchless}%</span>
                    <div className={styles.segmentTouchlessBar}>
                      <div className={styles.segmentTouchlessFill} style={{ width: `${seg.touchless}%`, background: seg.color }} />
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.segmentRenewalValue} style={{ color: seg.status === 'at-risk' ? '#F76560' : '#23C343' }}>
                    {seg.renewal}
                  </span>
                </td>
                <td>
                  <span className={styles.segmentNpsValue} style={{ color: seg.nps >= 70 ? '#23C343' : seg.nps >= 60 ? '#FF9A2E' : '#F76560' }}>
                    {seg.nps}
                  </span>
                </td>
                <td>
                  {seg.status === 'at-risk' ? (
                    <span className={styles.segmentAtRiskBadge}>At-Risk</span>
                  ) : seg.status === 'onboarding' ? (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: 'rgba(255, 154, 46, 0.1)', color: '#FF9A2E', padding: '0.2rem 0.625rem', borderRadius: '9999px' }}>Onboarding</span>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: 'rgba(35, 195, 67, 0.1)', color: '#23C343', padding: '0.2rem 0.625rem', borderRadius: '9999px' }}>Healthy</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.segmentNote}>
          <span className={styles.segmentNoteIcon}>&#x26A0;&#xFE0F;</span>
          <span><span className={styles.segmentNoteStrong}>12 customers in at-risk zone</span> (&lt;70% touchless processing) &mdash; escalation recommended to prevent churn</span>
        </div>
      </div>

      {/* ── Touchless Improvement Roadmap ────────────────────────── */}
      <div className={styles.roadmapSection}>
        <div className={styles.roadmapSectionTitle}>
          Touchless Improvement Roadmap
          <span className={styles.roadmapSectionBadge}>5.1% remaining gap</span>
        </div>
        <div className={styles.roadmapSectionSubtitle}>
          Closing the gap from 94.9% to 100% touchless processing &mdash; prioritized by impact
        </div>
        <div className={styles.roadmapItems}>
          {[
            { pct: '2.1%', title: 'New Supplier Onboarding', desc: 'First-invoice learning requires 3\u20135 samples before the model reaches high-confidence extraction and matching.', progress: 45, target: 'Q2 2026', status: 'In Progress', statusClass: 'roadmapStatusInProgress' as const, color: '#165DFF' },
            { pct: '1.4%', title: 'Complex PO Structures', desc: 'Multi-line, multi-currency POs need enhanced matching logic and tolerance rules.', progress: 30, target: 'Q3 2026', status: 'In Progress', statusClass: 'roadmapStatusInProgress' as const, color: '#165DFF' },
            { pct: '0.9%', title: 'Missing Master Data', desc: 'Incomplete vendor records cause manual routing. Data enrichment pipeline being built.', progress: 60, target: 'Q2 2026', status: 'Pilot', statusClass: 'roadmapStatusPilot' as const, color: '#8E51DA' },
            { pct: '0.7%', title: 'Edge Case Exceptions', desc: 'Unusual invoice formats, handwritten documents, and non-standard layouts requiring specialized models.', progress: 15, target: 'Q4 2026', status: 'Planned', statusClass: 'roadmapStatusPlanned' as const, color: '#86909C' },
          ].map((item) => (
            <div key={item.title} className={styles.roadmapItem}>
              <div className={styles.roadmapItemLeft}>
                <div className={styles.roadmapItemPercent}>{item.pct}</div>
                <div className={styles.roadmapItemPercentLabel}>of gap</div>
              </div>
              <div className={styles.roadmapItemCenter}>
                <div className={styles.roadmapItemTitle}>{item.title}</div>
                <div className={styles.roadmapItemDesc}>{item.desc}</div>
                <div className={styles.roadmapItemProgressTrack}>
                  <div
                    className={styles.roadmapItemProgressFill}
                    style={{ width: `${item.progress}%`, background: item.color }}
                  />
                </div>
              </div>
              <div className={styles.roadmapItemRight}>
                <div className={styles.roadmapItemTargetLabel}>Target</div>
                <div className={styles.roadmapItemTargetDate}>{item.target}</div>
                <span className={`${styles.roadmapItemStatusBadge} ${styles[item.statusClass]}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline */}
      {renderPipeline()}

      {/* Agent Health Grid */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Agent Health
          <span className={styles.sectionTitleBadge}>9 agents</span>
        </div>
        <div className={styles.agentGrid}>
          {agents.map((agent, idx) => (
            <div key={agent.name} className={styles.agentCard}>
              <div className={styles.agentCardHeader}>
                <div className={styles.agentCardNameRow}>
                  <div className={styles.agentCardIcon} style={{ background: agent.iconBg }}>
                    {agent.icon}
                  </div>
                  <div className={styles.agentCardNameBlock}>
                    <span className={styles.agentCardName}>{agent.name}</span>
                    <span className={styles.agentCardAutonomy}>Autonomy: {agent.autonomy}</span>
                  </div>
                </div>
                <span className={`${styles.agentCardStatusBadge} ${
                  agent.status === 'active' ? styles.agentCardStatusActive :
                  agent.status === 'idle' ? styles.agentCardStatusIdle :
                  styles.agentCardStatusError
                }`}>
                  <span className={`${styles.agentStatusDot} ${
                    agent.status === 'active' ? styles.agentDotActive :
                    agent.status === 'idle' ? styles.agentDotIdle :
                    styles.agentDotError
                  }`} />
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              </div>

              <div className={styles.agentCardMetrics}>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Docs Today</span>
                  <span className={styles.agentMetricValue}>{agent.docsToday}</span>
                </div>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Accuracy</span>
                  <div className={styles.sparklineRow}>
                    <span className={`${styles.agentMetricValue} ${styles.agentMetricValueGreen}`}>
                      {agent.accuracy}%
                    </span>
                    <div className={styles.sparkline}>
                      {agent.sparkline.map((val, si) => (
                        <div
                          key={si}
                          className={styles.sparklineBar}
                          style={{
                            height: `${(val / 100) * 20}px`,
                            background: val >= 97 ? '#23C343' : val >= 93 ? '#165DFF' : '#D97706',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Avg Latency</span>
                  <span className={styles.agentMetricValue}>{agent.latency}</span>
                </div>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Queue Depth</span>
                  <span className={styles.agentMetricValue}>{agent.queueDepth}</span>
                </div>
              </div>

              <div className={styles.agentCardFooter}>
                {agent.lastError ? (
                  <span className={styles.agentError} title={agent.lastError}>{agent.lastError}</span>
                ) : (
                  <span className={styles.agentNoError}>No errors</span>
                )}
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={agent.enabled}
                    onChange={() => toggleAgent(idx)}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  /* ─── Render Agents Tab ────────────────────────────────────── */

  const renderAgents = () => (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          All Agents
          <span className={styles.sectionTitleBadge}>{agents.length} total</span>
        </div>
        <div className={styles.agentGrid}>
          {agents.map((agent, idx) => (
            <div key={agent.name} className={styles.agentCard}>
              <div className={styles.agentCardHeader}>
                <div className={styles.agentCardNameRow}>
                  <div className={styles.agentCardIcon} style={{ background: agent.iconBg }}>
                    {agent.icon}
                  </div>
                  <div className={styles.agentCardNameBlock}>
                    <span className={styles.agentCardName}>{agent.name}</span>
                    <span className={styles.agentCardAutonomy}>Autonomy: {agent.autonomy}</span>
                  </div>
                </div>
                <span className={`${styles.agentCardStatusBadge} ${
                  agent.status === 'active' ? styles.agentCardStatusActive :
                  agent.status === 'idle' ? styles.agentCardStatusIdle :
                  styles.agentCardStatusError
                }`}>
                  <span className={`${styles.agentStatusDot} ${
                    agent.status === 'active' ? styles.agentDotActive :
                    agent.status === 'idle' ? styles.agentDotIdle :
                    styles.agentDotError
                  }`} />
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              </div>

              <div className={styles.agentCardMetrics}>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Docs Today</span>
                  <span className={styles.agentMetricValue}>{agent.docsToday}</span>
                </div>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Accuracy</span>
                  <div className={styles.sparklineRow}>
                    <span className={`${styles.agentMetricValue} ${styles.agentMetricValueGreen}`}>
                      {agent.accuracy}%
                    </span>
                    <div className={styles.sparkline}>
                      {agent.sparkline.map((val, si) => (
                        <div
                          key={si}
                          className={styles.sparklineBar}
                          style={{
                            height: `${(val / 100) * 20}px`,
                            background: val >= 97 ? '#23C343' : val >= 93 ? '#165DFF' : '#D97706',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Avg Latency</span>
                  <span className={styles.agentMetricValue}>{agent.latency}</span>
                </div>
                <div className={styles.agentMetric}>
                  <span className={styles.agentMetricLabel}>Queue Depth</span>
                  <span className={styles.agentMetricValue}>{agent.queueDepth}</span>
                </div>
              </div>

              <div className={styles.agentCardFooter}>
                {agent.lastError ? (
                  <span className={styles.agentError} title={agent.lastError}>{agent.lastError}</span>
                ) : (
                  <span className={styles.agentNoError}>No errors</span>
                )}
                <label className={styles.toggleSwitch}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={agent.enabled}
                    onChange={() => toggleAgent(idx)}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  /* ─── Render Decisions Tab ─────────────────────────────────── */

  const renderDecisions = () => (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        Decision Log
        <span className={styles.sectionTitleBadge}>{filteredDecisions.length} decisions</span>
      </div>

      {/* Filters */}
      <div className={styles.filtersRow}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Agent</span>
          <select className={styles.filterSelect} value={filterAgent} onChange={e => setFilterAgent(e.target.value)}>
            <option value="all">All Agents</option>
            <option value="Capture Agent">Capture Agent</option>
            <option value="Classification Agent">Classification Agent</option>
            <option value="Compliance Agent">Compliance Agent</option>
            <option value="Matching Agent">Matching Agent</option>
            <option value="Risk Agent">Risk Agent</option>
            <option value="Approval Agent">Approval Agent</option>
            <option value="Payment Agent">Payment Agent</option>
            <option value="Communication Agent">Communication Agent</option>
            <option value="Advisory Agent">Advisory Agent</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Min Confidence</span>
          <select className={styles.filterSelect} value={filterConfMin} onChange={e => setFilterConfMin(e.target.value)}>
            <option value="0">Any</option>
            <option value="70">70%+</option>
            <option value="80">80%+</option>
            <option value="90">90%+</option>
            <option value="95">95%+</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Outcome</span>
          <select className={styles.filterSelect} value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)}>
            <option value="all">All Outcomes</option>
            <option value="Executed">Executed</option>
            <option value="Queued">Queued</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Decision Table */}
      <table className={styles.decisionTable}>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Agent</th>
            <th>Invoice</th>
            <th>Action Taken</th>
            <th>Confidence</th>
            <th>Reasoning</th>
            <th>Outcome</th>
            <th>Override</th>
          </tr>
        </thead>
        <tbody>
          {filteredDecisions.map((d) => (
            <React.Fragment key={d.id}>
              <tr
                className={`${styles.decisionRow} ${expandedDecision === d.id ? styles.decisionRowExpanded : ''}`}
                onClick={() => setExpandedDecision(expandedDecision === d.id ? null : d.id)}
              >
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.75rem', color: '#6B7280' }}>{d.timestamp}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{d.agent.replace(' Agent', '')}</td>
                <td style={{ color: '#165DFF', fontWeight: 500 }}>{d.invoice}</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.action}</td>
                <td>
                  <div className={styles.confidenceBar}>
                    <div className={styles.confidenceBarTrack}>
                      <div className={styles.confidenceBarFill} style={{ width: `${d.confidence}%`, background: getConfidenceColor(d.confidence) }} />
                    </div>
                    <span className={styles.confidenceValue} style={{ color: getConfidenceColor(d.confidence) }}>{d.confidence}%</span>
                  </div>
                </td>
                <td><span className={styles.reasoningText}>{d.reasoning}</span></td>
                <td>
                  <span className={`${styles.outcomeBadge} ${
                    d.outcome === 'Executed' ? styles.outcomeExecuted :
                    d.outcome === 'Queued' ? styles.outcomeQueued :
                    styles.outcomeBlocked
                  }`}>{d.outcome}</span>
                </td>
                <td>
                  {d.humanOverride ? (
                    <span className={styles.overrideYes}>Yes</span>
                  ) : (
                    <span className={styles.overrideNo}>No</span>
                  )}
                </td>
              </tr>
              {expandedDecision === d.id && (
                <tr key={`${d.id}-detail`}>
                  <td colSpan={8} className={styles.detailPanelCell}>
                    <div className={styles.detailPanel}>
                      <div className={styles.detailGrid}>
                        {/* Full Reasoning */}
                        <div className={styles.detailSection}>
                          <div className={styles.detailSectionTitle}>Full Reasoning</div>
                          <p className={styles.detailReasoning}>{d.reasoning}</p>
                        </div>

                        {/* Factor Breakdown */}
                        <div className={styles.detailSection}>
                          <div className={styles.detailSectionTitle}>Factor Breakdown</div>
                          {d.factors.map((f) => (
                            <div key={f.name} className={styles.factorRow}>
                              <span className={styles.factorName}>{f.name}</span>
                              <div className={styles.factorBarOuter}>
                                <div className={styles.factorBarInner} style={{ width: `${f.score}%`, background: f.color }} />
                              </div>
                              <span className={styles.factorWeight}>{(f.weight * 100).toFixed(0)}%</span>
                              <span className={styles.factorScore}>{f.score.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Alternatives Considered */}
                        <div className={styles.detailSection}>
                          <div className={styles.detailSectionTitle}>Alternatives Considered</div>
                          <div className={styles.alternativesList}>
                            {d.alternatives.map((alt, ai) => (
                              <div key={ai} className={styles.alternativeItem}>
                                <span className={styles.alternativeAction}>{alt.action}</span>
                                <span className={styles.alternativeConf}>{alt.confidence}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Similar Past Decisions */}
                        <div className={styles.detailSection}>
                          <div className={styles.detailSectionTitle}>Similar Past Decisions</div>
                          <div className={styles.pastDecisionsList}>
                            {d.pastDecisions.map((pd) => (
                              <div key={pd.id} className={styles.pastDecisionItem}>
                                <span className={styles.pastDecisionId}>{pd.id}</span>
                                <span className={styles.pastDecisionAction}>{pd.action}</span>
                                <span className={styles.pastDecisionOutcome} style={{
                                  color: pd.outcome.toLowerCase().includes('success') || pd.outcome.toLowerCase().includes('correct') || pd.outcome.toLowerCase().includes('passed') || pd.outcome.toLowerCase().includes('no issues') || pd.outcome.toLowerCase().includes('acknowledged')
                                    ? '#23C343' : pd.outcome.toLowerCase().includes('fraud') || pd.outcome.toLowerCase().includes('reject')
                                    ? '#DC2626' : '#D97706'
                                }}>{pd.outcome}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button className={styles.overrideButton}>Override Decision</button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  /* ─── Render Configuration Tab ─────────────────────────────── */

  const renderConfiguration = () => (
    <>
      {/* Per-Agent Configuration */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Per-Agent Configuration
          <span className={styles.sectionTitleBadge}>{configs.length} agents</span>
        </div>
        <div className={styles.configGrid}>
          {configs.map((cfg, idx) => (
            <div key={cfg.name} className={styles.configCard}>
              <div className={styles.configCardHeader}>
                <div className={styles.configCardIcon} style={{ background: cfg.iconBg }}>
                  {cfg.icon}
                </div>
                <span className={styles.configCardName}>{cfg.name}</span>
              </div>

              {/* Confidence Threshold Slider */}
              <div className={styles.configRow}>
                <div className={styles.configToggleRow}>
                  <span className={styles.configLabel}>Confidence Threshold</span>
                  <span className={styles.configSliderValue}>{cfg.confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  className={styles.configSlider}
                  min={50}
                  max={99}
                  value={cfg.confidenceThreshold}
                  onChange={e => updateConfig(idx, 'confidenceThreshold', Number(e.target.value))}
                />
              </div>

              {/* Auto-Execute Toggle */}
              <div className={styles.configRow}>
                <div className={styles.configToggleRow}>
                  <span className={styles.configLabel}>Auto-Execute</span>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      className={styles.toggleInput}
                      checked={cfg.autoExecute}
                      onChange={() => updateConfig(idx, 'autoExecute', !cfg.autoExecute)}
                    />
                    <span className={styles.toggleSlider} />
                  </label>
                </div>
              </div>

              {/* Escalation Rules */}
              <div className={styles.configRow}>
                <span className={styles.configLabel}>Escalation Rule</span>
                <select
                  className={styles.configSelect}
                  value={cfg.escalationRule}
                  onChange={e => updateConfig(idx, 'escalationRule', e.target.value)}
                >
                  <option value="Never">Never</option>
                  <option value="Low Confidence">Low Confidence</option>
                  <option value="Always">Always</option>
                </select>
              </div>

              {/* Max Queue Depth */}
              <div className={styles.configRow}>
                <span className={styles.configLabel}>Max Queue Depth</span>
                <input
                  type="number"
                  className={styles.configInput}
                  value={cfg.maxQueueDepth}
                  onChange={e => updateConfig(idx, 'maxQueueDepth', Number(e.target.value))}
                />
              </div>

              {/* Retry Count */}
              <div className={styles.configRow}>
                <span className={styles.configLabel}>Retry Count</span>
                <input
                  type="number"
                  className={styles.configInput}
                  value={cfg.retryCount}
                  min={0}
                  max={10}
                  onChange={e => updateConfig(idx, 'retryCount', Number(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Settings */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Global Settings
          <span className={styles.sectionTitleBadge}>Pipeline</span>
        </div>
        <div className={styles.globalSettingsGrid}>
          {/* Pipeline Mode */}
          <div className={styles.globalSettingCard}>
            <div className={styles.globalSettingInfo}>
              <span className={styles.globalSettingLabel}>Pipeline Mode</span>
              <span className={styles.globalSettingDescription}>Sequential processes one at a time; Parallel where possible runs independent stages concurrently</span>
            </div>
            <div className={styles.globalSettingControl}>
              <select
                className={styles.configSelect}
                style={{ width: 'auto', minWidth: '180px' }}
                value={pipelineMode}
                onChange={e => setPipelineMode(e.target.value)}
              >
                <option value="sequential">Sequential</option>
                <option value="parallel">Parallel Where Possible</option>
              </select>
            </div>
          </div>

          {/* HITL Threshold */}
          <div className={styles.globalSettingCard}>
            <div className={styles.globalSettingInfo}>
              <span className={styles.globalSettingLabel}>Human-in-the-Loop Threshold</span>
              <span className={styles.globalSettingDescription}>Confidence below this threshold requires human approval</span>
            </div>
            <div className={styles.globalSettingControl}>
              <span className={styles.globalSettingValue}>{hitlThreshold}%</span>
              <input
                type="range"
                className={styles.configSlider}
                style={{ width: '120px' }}
                min={50}
                max={99}
                value={hitlThreshold}
                onChange={e => setHitlThreshold(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Auto-Learning */}
          <div className={styles.globalSettingCard}>
            <div className={styles.globalSettingInfo}>
              <span className={styles.globalSettingLabel}>Auto-Learning Enabled</span>
              <span className={styles.globalSettingDescription}>Agents learn from human overrides and feedback to improve accuracy</span>
            </div>
            <div className={styles.globalSettingControl}>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={autoLearning}
                  onChange={() => setAutoLearning(!autoLearning)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>

          {/* Feedback Integration */}
          <div className={styles.globalSettingCard}>
            <div className={styles.globalSettingInfo}>
              <span className={styles.globalSettingLabel}>Feedback Integration</span>
              <span className={styles.globalSettingDescription}>Collect and incorporate user feedback into agent training pipeline</span>
            </div>
            <div className={styles.globalSettingControl}>
              <label className={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={feedbackIntegration}
                  onChange={() => setFeedbackIntegration(!feedbackIntegration)}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  /* ─── Render Audit Tab ─────────────────────────────────────── */

  const renderAudit = () => {
    const totalDecisions = agentAccuracyData.reduce((sum, a) => sum + a.decisions, 0);
    const totalOverrides = agentAccuracyData.reduce((sum, a) => sum + a.overrides, 0);
    const overrideRate = ((totalOverrides / totalDecisions) * 100).toFixed(2);
    const weightedAccuracy = agentAccuracyData.reduce((sum, a) => sum + a.accuracy * a.decisions, 0) / totalDecisions;

    return (
      <>
        {/* Audit Summary */}
        <div className={styles.auditSummaryGrid}>
          <div className={styles.auditSummaryCard}>
            <div className={styles.auditSummaryValue}>{totalDecisions.toLocaleString()}</div>
            <div className={styles.auditSummaryLabel}>Total Decisions This Month</div>
          </div>
          <div className={styles.auditSummaryCard}>
            <div className={styles.auditSummaryValue} style={{ color: '#D97706' }}>{overrideRate}%</div>
            <div className={styles.auditSummaryLabel}>Override Rate</div>
          </div>
          <div className={styles.auditSummaryCard}>
            <div className={styles.auditSummaryValue} style={{ color: '#23C343' }}>{weightedAccuracy.toFixed(1)}%</div>
            <div className={styles.auditSummaryLabel}>Weighted Avg Accuracy</div>
          </div>
          <div className={styles.auditSummaryCard}>
            <div className={styles.auditSummaryValue} style={{ color: '#165DFF' }}>{totalOverrides}</div>
            <div className={styles.auditSummaryLabel}>Human Overrides</div>
          </div>
        </div>

        {/* Accuracy by Agent + Error Log */}
        <div className={styles.auditTwoCol}>
          {/* Accuracy by Agent Table */}
          <div className={styles.section} style={{ marginBottom: 0 }}>
            <div className={styles.sectionTitle}>
              Accuracy by Agent
              <span className={styles.sectionTitleBadge}>This month</span>
            </div>
            <table className={styles.auditTable}>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Decisions</th>
                  <th>Accuracy</th>
                  <th>Overrides</th>
                </tr>
              </thead>
              <tbody>
                {agentAccuracyData.map((a) => (
                  <tr key={a.agent}>
                    <td>{a.agent}</td>
                    <td>{a.decisions.toLocaleString()}</td>
                    <td>
                      <span className={a.accuracy >= 97 ? styles.accuracyHigh : styles.accuracyMedium}>
                        {a.accuracy}%
                      </span>
                    </td>
                    <td>{a.overrides}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Error Log */}
          <div className={styles.section} style={{ marginBottom: 0 }}>
            <div className={styles.sectionTitle}>
              Error Log
              <span className={styles.sectionTitleBadge}>Last 20 errors</span>
            </div>
            <div className={styles.errorLogList}>
              {errorLog.map((err, i) => (
                <div key={i} className={styles.errorLogItem}>
                  <span className={styles.errorLogTime}>{err.time}</span>
                  <span className={styles.errorLogAgent}>{err.agent}</span>
                  <span className={styles.errorLogMessage}>{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Compliance Report Preview */}
        <div className={styles.complianceReport}>
          <div className={styles.complianceReportHeader}>
            <span className={styles.complianceReportIcon}>{'\u2705'}</span>
            <span className={styles.complianceReportTitle}>Compliance Report Preview</span>
          </div>
          <p className={styles.complianceReportText}>
            All agent decisions logged. 100% audit trail coverage. SOC 2 compliant. Every autonomous action is recorded with full reasoning, confidence scores, factor breakdowns, and alternative actions considered. Human overrides are tracked and integrated into continuous learning pipelines.
          </p>
          <div className={styles.complianceReportChecks}>
            <div className={styles.complianceCheck}>
              <span className={styles.complianceCheckIcon}>{'\u2713'}</span>
              100% Decision Logging
            </div>
            <div className={styles.complianceCheck}>
              <span className={styles.complianceCheckIcon}>{'\u2713'}</span>
              Full Audit Trail
            </div>
            <div className={styles.complianceCheck}>
              <span className={styles.complianceCheckIcon}>{'\u2713'}</span>
              SOC 2 Type II
            </div>
            <div className={styles.complianceCheck}>
              <span className={styles.complianceCheckIcon}>{'\u2713'}</span>
              GDPR Compliant
            </div>
            <div className={styles.complianceCheck}>
              <span className={styles.complianceCheckIcon}>{'\u2713'}</span>
              ISO 27001
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className={styles.exportRow}>
          <button className={styles.exportButton}>
            <span className={styles.exportButtonIcon}>{'\uD83D\uDCC4'}</span>
            Export Decision Log (CSV)
          </button>
          <button className={styles.exportButton}>
            <span className={styles.exportButtonIcon}>{'\uD83D\uDCC3'}</span>
            Export Audit Report (PDF)
          </button>
        </div>
      </>
    );
  };

  /* ─── Main Render ──────────────────────────────────────────── */

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>{t('agentStudio.title')}</h1>
            <p className={styles.subtitle}>{t('agentStudio.subtitle')}</p>
          </div>
          <div className={styles.headerBadge}>
            <span className={styles.headerBadgeIcon}>{'\uD83E\uDD16'}</span>
            <div className={styles.headerBadgeContent}>
              <span className={styles.headerBadgeLabel}>{t('agentStudio.totalAgents')}</span>
              <span className={styles.headerBadgeValue}>9 Agents Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'agents' && renderAgents()}
      {activeTab === 'decisions' && renderDecisions()}
      {activeTab === 'configuration' && renderConfiguration()}
      {activeTab === 'audit' && renderAudit()}
    </div>
  );
}
