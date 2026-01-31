"use client";

import { useState, useRef, useEffect } from 'react';
import { useCopilot } from '@/lib/copilot/copilot-context';
import { useT } from '@/lib/i18n/locale-context';
import { ChatMessage } from './ChatMessage';
import { SuggestionChips } from './SuggestionChips';
import styles from './CopilotDrawer.module.css';

const MODULE_LABELS: Record<string, string> = {
  invoices: 'Invoices',
  purchase_orders: 'Purchase Orders',
  contracts: 'Contracts',
  expenses: 'Expenses',
  suppliers: 'Suppliers',
  payments: 'Payments',
  risk: 'Risk',
  cashflow: 'Cash Flow',
  agents: 'Agents',
  dashboard: 'Dashboard',
  general: 'General',
};

export function CopilotDrawer() {
  const {
    isOpen,
    open,
    close,
    messages,
    sendQuery,
    clearMessages,
    currentModule,
    isLoading,
    suggestions,
  } = useCopilot();
  const t = useT();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendQuery(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendQuery(suggestion);
  };

  return (
    <>
      {/* Collapsed tab */}
      {!isOpen && (
        <button className={styles.tab} onClick={open}>
          AI Copilot
        </button>
      )}

      {/* Drawer panel */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <div className={styles.title}>{t('copilot.title')}</div>
              <div className={styles.subtitle}>{t('copilot.subtitle')}</div>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.clearBtn}
                onClick={clearMessages}
                title={t('copilot.clearChat')}
              >
                {'\u2715'}
              </button>
              <button className={styles.closeBtn} onClick={close}>
                {'\u2192'}
              </button>
            </div>
          </div>
          <div className={styles.contextLabel}>
            {t('copilot.contextLabel') !== 'copilot.contextLabel'
              ? t('copilot.contextLabel')
              : 'Context'}: {MODULE_LABELS[currentModule] || currentModule}
          </div>
        </div>

        {/* Shortcut hint */}
        <div className={styles.shortcutHint}>
          Toggle with <kbd>{'\u2318'}</kbd> + <kbd>{'\u21E7'}</kbd> + <kbd>I</kbd>
        </div>

        {/* Messages */}
        <div className={styles.messageList}>
          {messages.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>AI</div>
              <div className={styles.emptyTitle}>
                {t('copilot.noMessages') !== 'copilot.noMessages'
                  ? t('copilot.noMessages')
                  : 'Ask me anything'}
              </div>
              <div className={styles.emptySubtitle}>
                {t('copilot.subtitle')}
              </div>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        <SuggestionChips
          suggestions={messages.length === 0 ? suggestions : suggestions.slice(0, 3)}
          onSelect={handleSuggestionClick}
        />

        {/* Input area */}
        <div className={styles.inputArea}>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder={t('copilot.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading
              ? (t('copilot.thinking') !== 'copilot.thinking' ? t('copilot.thinking') : 'Thinking...')
              : t('copilot.send')}
          </button>
        </div>
      </div>
    </>
  );
}
