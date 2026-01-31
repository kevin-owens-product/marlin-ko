import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

const defaults = { size: 20, className: '' };

function icon(d: string | string[], opts?: { fill?: boolean }) {
  const paths = Array.isArray(d) ? d : [d];
  return function Icon({ size = defaults.size, className = defaults.className }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
      >
        {paths.map((p, i) => (
          <path key={i} d={p} fill={opts?.fill ? 'currentColor' : 'none'} />
        ))}
      </svg>
    );
  };
}

// --- Overview ---

export const DashboardIcon = icon([
  'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z',
]);

export const ActivityIcon = icon([
  'M3 10h3l2-5 4 10 2-5h3',
]);

// --- Accounts Payable ---

export const InvoiceIcon = icon([
  'M6 2h8l3 3v12a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z',
  'M14 2v3h3',
  'M8 9h6M8 12h4',
]);

export const ApprovalIcon = icon([
  'M6 10l3 3 6-6',
  'M10 18a8 8 0 100-16 8 8 0 000 16z',
]);

export const MatchingIcon = icon([
  'M4 8h5M11 8h5M4 12h5M11 12h5',
  'M8 5v10M12 5v10',
]);

export const CodingIcon = icon([
  'M7 5l-4 5 4 5M13 5l4 5-4 5',
  'M11 3l-2 14',
]);

// --- Finance ---

export const PaymentsIcon = icon([
  'M2 6h16v10H2zM2 9h16',
  'M5 13h3',
]);

export const DiscountingIcon = icon([
  'M15 5L5 15',
  'M6.5 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  'M13.5 15a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
]);

export const VirtualCardsIcon = icon([
  'M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z',
  'M2 9h16',
  'M5 13h2M11 13h2',
]);

export const SupplyChainIcon = icon([
  'M4 10h12M8 6l-4 4 4 4M12 6l4 4-4 4',
]);

export const ExpensesIcon = icon([
  'M3 4l7-2 7 2v6c0 4-3.5 7-7 8-3.5-1-7-4-7-8V4z',
  'M10 8v4M8 10h4',
]);

export const CashFlowIcon = icon([
  'M2 15V5M6 15V8M10 15V3M14 15V7M18 15V10',
]);

export const TreasuryIcon = icon([
  'M3 17h14M5 13v4M10 13v4M15 13v4',
  'M3 13h14',
  'M10 5l7 4v4H3V9l7-4z',
  'M10 3v2',
]);

// --- Procurement ---

export const PurchaseOrderIcon = icon([
  'M4 2h12a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z',
  'M7 6h6M7 9h6M7 12h4',
]);

export const ContractsIcon = icon([
  'M14 2H6a1 1 0 00-1 1v14a1 1 0 001 1h8a1 1 0 001-1V3a1 1 0 00-1-1z',
  'M9 6h2M8 9h4',
  'M8 12c0 1 .8 2 2 2s2-1 2-2',
]);

// --- Suppliers ---

export const NetworkMapIcon = icon([
  'M10 18a8 8 0 100-16 8 8 0 000 16z',
  'M2 10h16',
  'M10 2a12 12 0 014 8 12 12 0 01-4 8 12 12 0 01-4-8 12 12 0 014-8z',
]);

export const OnboardingPipelineIcon = icon([
  'M3 4h14l-3 5 3 5H3V4z',
  'M3 4v10',
]);

export const PerformanceIcon = icon([
  'M4 17V10M8 17V6M12 17V8M16 17V3',
]);

export const DiversityIcon = icon([
  'M7 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  'M13 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  'M1 17c0-2.5 2.5-4 6-4s6 1.5 6 4',
  'M13 13c2.5 0 5 1.5 5 4',
  'M15.5 17.5c-.3-.8-1.2-1.5-2.5-1.5',
]);

export const SupplierDirectoryIcon = icon([
  'M10 9a3 3 0 100-6 3 3 0 000 6z',
  'M3 17c0-3 3-5 7-5s7 2 7 5',
]);

export const SupplierPortalIcon = icon([
  'M10 18a8 8 0 100-16 8 8 0 000 16z',
  'M10 6v4l3 2',
  'M2 10h2M16 10h2M10 2v2M10 16v2',
]);

export const ConversationsIcon = icon([
  'M4 4h12a1 1 0 011 1v7a1 1 0 01-1 1H8l-4 3v-3a1 1 0 01-1-1V5a1 1 0 011-1z',
  'M7 8h6M7 10.5h3',
]);

export const RiskMonitorIcon = icon([
  'M10 3l-8 14h16L10 3z',
  'M10 8v4',
  'M10 14v0',
]);

// --- Intelligence ---

export const AnalyticsIcon = icon([
  'M3 3v14h14',
  'M6 13l3-4 3 2 4-5',
]);

export const BenchmarksIcon = icon([
  'M4 17V9M8 17V5M12 17V8M16 17V3',
]);

export const ReportsIcon = icon([
  'M5 2h10a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z',
  'M7 6h6M7 9h6M7 12h3',
]);

export const CopilotIcon = icon([
  'M10 2a4 4 0 014 4v2H6V6a4 4 0 014-4z',
  'M5 8h10a2 2 0 012 2v3a5 5 0 01-10 0h0a5 5 0 01-4-3v0a2 2 0 01-1-2v-1a1 1 0 011-1h0z',
  'M7 12h0M13 12h0',
]);

// --- AI & Automation ---

export const AgentStudioIcon = icon([
  'M10 2a2 2 0 012 2v1h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h2V4a2 2 0 012-2z',
  'M7 10h0M13 10h0',
  'M8 13h4',
]);

export const RiskDashboardIcon = icon([
  'M10 18a8 8 0 100-16 8 8 0 000 16z',
  'M10 6v4l2 2',
]);

export const ComplianceIcon = icon([
  'M3 4l7-2 7 2v6c0 4-3.5 7-7 8-3.5-1-7-4-7-8V4z',
  'M7 10l2 2 4-4',
]);

// --- Admin ---

export const SettingsIcon = icon([
  'M10 13a3 3 0 100-6 3 3 0 000 6z',
  'M10 1v3M10 16v3M18.36 5.64l-2.12 2.12M3.76 12.24l-2.12 2.12M19 10h-3M4 10H1M16.24 16.24l-2.12-2.12M5.76 5.76L3.64 3.64',
]);

export const AuditIcon = icon([
  'M5 2h10a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z',
  'M7 6h1M10 6h3M7 9h1M10 9h3M7 12h1M10 12h3',
]);

export const OnboardingIcon = icon([
  'M10 18a8 8 0 100-16 8 8 0 000 16z',
  'M10 6l3 4h-2v4H9v-4H7l3-4z',
]);

// --- CPO Strategy ---

export const CpoPortalIcon = icon([
  'M10 2l7 4v4c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-4z',
  'M7 10l2 2 4-4',
]);

// --- Utility icons ---

export const ChevronRightIcon = icon([
  'M7 4l6 6-6 6',
]);

export const CollapseLeftIcon = icon([
  'M15 4l-6 6 6 6',
]);

export const CollapseRightIcon = icon([
  'M5 4l6 6-6 6',
]);
