"use client";

import type { ReactNode } from 'react';
import type { CopilotMessage, ResponseBlock } from '@/lib/copilot/types';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: CopilotMessage;
}

function renderBold(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function TextBlockRenderer({ content }: { content: string }) {
  return <div className={styles.textBlock}>{renderBold(content)}</div>;
}

function TableBlockRenderer({
  headers,
  rows,
  totalCount,
}: {
  headers: string[];
  rows: string[][];
  totalCount?: number;
}) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalCount && totalCount > rows.length && (
        <div className={styles.tableFooter}>
          Showing {rows.length} of {totalCount}
        </div>
      )}
    </div>
  );
}

function SummaryCardBlockRenderer({
  cards,
}: {
  cards: { label: string; value: string; trend?: string }[];
}) {
  return (
    <div className={styles.summaryRow}>
      {cards.map((card) => (
        <div key={card.label} className={styles.summaryCard}>
          <div className={styles.summaryLabel}>{card.label}</div>
          <div
            className={`${styles.summaryValue} ${
              card.trend === 'negative' ? styles.summaryNegative : ''
            }`}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActionButtonBlockRenderer({
  buttons,
}: {
  buttons: { label: string; href: string }[];
}) {
  return (
    <div className={styles.actionRow}>
      {buttons.map((btn) => (
        <a key={btn.href} href={btn.href} className={styles.actionBtn}>
          {btn.label}
        </a>
      ))}
    </div>
  );
}

function ErrorBlockRenderer({ message }: { message: string }) {
  return <div className={styles.errorBlock}>{message}</div>;
}

function LoadingDots() {
  return (
    <div className={styles.loadingDots}>
      <span />
      <span />
      <span />
    </div>
  );
}

function renderBlock(block: ResponseBlock, index: number) {
  switch (block.type) {
    case 'text':
      return <TextBlockRenderer key={index} content={block.content} />;
    case 'table':
      return (
        <TableBlockRenderer
          key={index}
          headers={block.headers}
          rows={block.rows}
          totalCount={block.totalCount}
        />
      );
    case 'summary_card':
      return <SummaryCardBlockRenderer key={index} cards={block.cards} />;
    case 'action_buttons':
      return <ActionButtonBlockRenderer key={index} buttons={block.buttons} />;
    case 'error':
      return <ErrorBlockRenderer key={index} message={block.message} />;
    default:
      return null;
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`${styles.message} ${isUser ? styles.messageUser : ''}`}>
      <div
        className={`${styles.avatar} ${
          isUser ? styles.avatarUser : styles.avatarCopilot
        }`}
      >
        {isUser ? 'You' : 'AI'}
      </div>
      <div className={styles.bubble}>
        {message.isLoading ? (
          <LoadingDots />
        ) : (
          <>
            {message.content && (
              <TextBlockRenderer content={message.content} />
            )}
            {message.blocks?.map((block, i) => renderBlock(block, i))}
          </>
        )}
        <div className={styles.timestamp}>{message.timestamp}</div>
      </div>
    </div>
  );
}
