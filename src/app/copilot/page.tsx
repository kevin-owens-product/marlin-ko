'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './copilot.module.css';

interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  table?: { headers: string[]; rows: string[][] };
}

const initialMessages: Message[] = [
  { id: 1, role: 'user', content: 'What invoices need attention today?', timestamp: '10:32 AM' },
  {
    id: 2, role: 'ai', timestamp: '10:32 AM',
    content: 'I found 23 invoices that require your attention today. Here are the most urgent ones:',
    table: {
      headers: ['Invoice #', 'Supplier', 'Amount', 'Issue', 'Priority'],
      rows: [
        ['INV-2024-001843', 'Baxter Medical', '$7,890', 'Low AI confidence (34.5%)', 'Critical'],
        ['INV-2024-001842', 'MexiParts Industrial', '$456K MXN', 'PO matching exception', 'High'],
        ['INV-2024-001838', 'Berlin Consulting AG', '€15,200', 'Duplicate detection', 'High'],
        ['INV-2024-001835', 'Paris Logistics SAS', '€8,400', 'Missing tax ID', 'Medium'],
        ['INV-2024-001831', 'Sydney Mining Corp', 'A$22,100', 'Overdue approval', 'Medium'],
      ],
    },
  },
  { id: 3, role: 'user', content: 'Which of those have matching exceptions?', timestamp: '10:33 AM' },
  {
    id: 4, role: 'ai', timestamp: '10:33 AM',
    content: 'Two invoices have PO matching exceptions:\n\n1. **INV-2024-001842** (MexiParts Industrial) — 3-way match failed. Invoice total is $456,000 MXN but PO #PO-2024-0234 shows $448,500 MXN. Variance of $7,500 (1.67%) exceeds the 1% tolerance.\n\n**Recommendation:** The variance is within the 2% threshold used for this supplier historically. I recommend adjusting the tolerance or approving with a note.\n\n2. **INV-2024-001838** (Berlin Consulting AG) — Flagged as potential duplicate of INV-2024-001790 from December. Same supplier, same amount (€15,200), 30-day gap. However, line items differ — this appears to be a recurring monthly retainer.\n\n**Recommendation:** Mark as non-duplicate and auto-approve. I\'ve seen this pattern for the last 6 months with this supplier.',
  },
];

const suggestions = [
  'Show me overdue invoices',
  'What\'s our current cash position?',
  'Analyze Q4 spending trends',
  'Which suppliers have the highest risk?',
  'Generate AP aging report',
  'Recommend payment optimizations',
];

export default function CopilotPage() {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: messages.length + 1, role: 'user', content: input, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const aiMsg: Message = { id: messages.length + 2, role: 'ai', content: 'I\'m analyzing your request. In a production environment, this would connect to the AI processing pipeline to generate a real-time response based on your invoice data, supplier information, and financial metrics.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.chatArea}>
        <div className={styles.chatHeader}>
          <div className={styles.chatTitle}>{t('copilot.title')}</div>
          <div className={styles.chatSubtitle}>{t('copilot.subtitle')}</div>
        </div>

        <div className={styles.messages}>
          {messages.map(m => (
            <div key={m.id} className={`${styles.msg} ${m.role === 'user' ? styles.msgUser : ''}`}>
              <div className={`${styles.msgAvatar} ${m.role === 'ai' ? styles.msgAvatarAi : styles.msgAvatarUser}`}>
                {m.role === 'ai' ? 'AI' : 'KO'}
              </div>
              <div className={styles.msgContent}>
                <div className={styles.msgText} style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                {m.table && (
                  <table className={styles.msgTable}>
                    <thead><tr>{m.table.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>{m.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                )}
                <div className={styles.msgTime}>{m.timestamp}</div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.suggestions}>
          {suggestions.map(s => (
            <button key={s} className={styles.suggestBtn} onClick={() => setInput(s)}>{s}</button>
          ))}
        </div>

        <div className={styles.inputArea}>
          <input className={styles.input} placeholder={t('copilot.placeholder')} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} />
          <button className={styles.sendBtn} onClick={handleSend}>{t('copilot.send')}</button>
        </div>
      </div>

      <div className={styles.sidebar}>
        <div className={styles.sideCard}>
          <div className={styles.sideTitle}>{t('dashboard.quickActions')}</div>
          <button className={styles.actionBtn}>🔍 Analyze Invoice</button>
          <button className={styles.actionBtn}>✅ Check Compliance</button>
          <button className={styles.actionBtn}>💰 Forecast Cash Flow</button>
          <button className={styles.actionBtn}>📊 Generate Report</button>
          <button className={styles.actionBtn}>⚠️ Review Risk Alerts</button>
        </div>

        <div className={styles.sideCard}>
          <div className={styles.sideTitle}>{t('copilot.suggestions')}</div>
          <div className={styles.capItem}>Invoice analysis & processing</div>
          <div className={styles.capItem}>Spend pattern detection</div>
          <div className={styles.capItem}>Cash flow forecasting</div>
          <div className={styles.capItem}>Supplier risk assessment</div>
          <div className={styles.capItem}>Compliance verification</div>
          <div className={styles.capItem}>Payment optimization</div>
          <div className={styles.capItem}>Anomaly detection</div>
          <div className={styles.capItem}>Natural language queries</div>
        </div>
      </div>
    </div>
  );
}
