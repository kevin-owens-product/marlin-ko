// ─── Copilot Module Identifiers ─────────────────────────────────────────────

export type CopilotModule =
  | 'invoices'
  | 'purchase_orders'
  | 'contracts'
  | 'expenses'
  | 'suppliers'
  | 'payments'
  | 'risk'
  | 'cashflow'
  | 'agents'
  | 'dashboard'
  | 'general';

// ─── Intent System ──────────────────────────────────────────────────────────

export interface IntentPattern {
  id: string;
  module: CopilotModule;
  action: string; // list, count, summarize, filter, find
  patterns: RegExp[];
  keywords: string[];
  extractParams?: (query: string) => Record<string, string>;
  description: string;
}

export interface ParsedIntent {
  intentId: string;
  module: CopilotModule;
  action: string;
  score: number;
  params: Record<string, string>;
}

// ─── Response Blocks ────────────────────────────────────────────────────────

export interface TextBlock {
  type: 'text';
  content: string; // supports **bold** via simple markdown
}

export interface TableBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  totalCount?: number; // if truncated, how many total
}

export interface SummaryCardBlock {
  type: 'summary_card';
  cards: { label: string; value: string; trend?: string }[];
}

export interface ActionButtonBlock {
  type: 'action_buttons';
  buttons: { label: string; href: string }[];
}

export interface ErrorBlock {
  type: 'error';
  message: string;
}

export type ResponseBlock =
  | TextBlock
  | TableBlock
  | SummaryCardBlock
  | ActionButtonBlock
  | ErrorBlock;

// ─── Messages ───────────────────────────────────────────────────────────────

export interface CopilotMessage {
  id: string;
  role: 'user' | 'copilot';
  content?: string;
  blocks?: ResponseBlock[];
  timestamp: string;
  isLoading?: boolean;
}

// ─── Context Value ──────────────────────────────────────────────────────────

export interface CopilotContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: CopilotMessage[];
  sendQuery: (query: string) => void;
  clearMessages: () => void;
  currentModule: CopilotModule;
  isLoading: boolean;
  suggestions: string[];
}

// ─── API Types ──────────────────────────────────────────────────────────────

export interface CopilotApiRequest {
  query: string;
  module: CopilotModule;
}

export interface CopilotApiResponse {
  blocks: ResponseBlock[];
  suggestions?: string[];
  intent?: {
    id: string;
    module: CopilotModule;
    action: string;
    score: number;
  };
}
