'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './audit.module.css';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ip: string;
}

const actionColors: Record<string, string> = {
  CREATED: styles.badgeGreen,
  UPDATED: styles.badgeBlue,
  DELETED: styles.badgeRed,
  APPROVED: styles.badgeGreen,
  REJECTED: styles.badgeRed,
  LOGIN: styles.badgePurple,
  EXPORT: styles.badgeAmber,
  CONFIGURED: styles.badgeGray,
};

const mockEntries: AuditEntry[] = [
  { id: '1', timestamp: '2024-01-30 14:52:03', user: 'Kevin Owens', action: 'APPROVED', entityType: 'Invoice', entityId: 'INV-2024-001847', details: 'Auto-approved by AI (confidence: 98.5%)', ip: '192.168.1.100' },
  { id: '2', timestamp: '2024-01-30 14:48:17', user: 'AI Agent', action: 'UPDATED', entityType: 'Invoice', entityId: 'INV-2024-001846', details: 'Status changed: Processing → Classified', ip: 'system' },
  { id: '3', timestamp: '2024-01-30 14:45:22', user: 'Sarah Chen', action: 'APPROVED', entityType: 'Invoice', entityId: 'INV-2024-001840', details: 'Manual approval with comment', ip: '192.168.1.105' },
  { id: '4', timestamp: '2024-01-30 14:42:11', user: 'AI Agent', action: 'CREATED', entityType: 'RiskAlert', entityId: 'RA-2024-0089', details: 'Duplicate invoice detected for Baxter Medical', ip: 'system' },
  { id: '5', timestamp: '2024-01-30 14:38:45', user: 'Mike Johnson', action: 'UPDATED', entityType: 'Supplier', entityId: 'SUP-0042', details: 'Updated payment terms: Net 30 → Net 45', ip: '192.168.1.112' },
  { id: '6', timestamp: '2024-01-30 14:35:00', user: 'System', action: 'EXPORT', entityType: 'Report', entityId: 'RPT-2024-0134', details: 'AP Aging Summary exported as PDF', ip: 'system' },
  { id: '7', timestamp: '2024-01-30 14:30:22', user: 'Kevin Owens', action: 'CONFIGURED', entityType: 'Setting', entityId: 'ai_confidence', details: 'AI confidence threshold changed: 90% → 92%', ip: '192.168.1.100' },
  { id: '8', timestamp: '2024-01-30 14:25:00', user: 'AI Agent', action: 'CREATED', entityType: 'Payment', entityId: 'PMT-2024-0567', details: 'Payment batch created: 12 invoices, $45,230', ip: 'system' },
  { id: '9', timestamp: '2024-01-30 14:20:45', user: 'Emma Wilson', action: 'LOGIN', entityType: 'User', entityId: 'USR-004', details: 'Login from Chrome on macOS', ip: '192.168.1.120' },
  { id: '10', timestamp: '2024-01-30 14:15:33', user: 'Sarah Chen', action: 'REJECTED', entityType: 'Invoice', entityId: 'INV-2024-001835', details: 'Rejected: Missing PO reference', ip: '192.168.1.105' },
  { id: '11', timestamp: '2024-01-30 14:10:00', user: 'AI Agent', action: 'UPDATED', entityType: 'Invoice', entityId: 'INV-2024-001844', details: 'GL Code assigned: 5100-Marketing (97.8% confidence)', ip: 'system' },
  { id: '12', timestamp: '2024-01-30 14:05:12', user: 'Mike Johnson', action: 'CREATED', entityType: 'Invoice', entityId: 'INV-2024-001848', details: 'Manual upload: PDF from vendor Acme Corp', ip: '192.168.1.112' },
  { id: '13', timestamp: '2024-01-30 14:00:00', user: 'System', action: 'CREATED', entityType: 'Invoice', entityId: 'INV-2024-001849', details: 'Received via Peppol network from Nordic Supplies AB', ip: 'system' },
  { id: '14', timestamp: '2024-01-30 13:55:44', user: 'Kevin Owens', action: 'UPDATED', entityType: 'Workflow', entityId: 'WF-003', details: 'High Value 3-Step workflow: threshold changed $50K → $25K', ip: '192.168.1.100' },
  { id: '15', timestamp: '2024-01-30 13:50:00', user: 'AI Agent', action: 'APPROVED', entityType: 'Expense', entityId: 'EXP-2024-0234', details: 'Auto-approved: Within policy ($87.50 meals)', ip: 'system' },
  { id: '16', timestamp: '2024-01-30 13:45:22', user: 'System', action: 'EXPORT', entityType: 'Report', entityId: 'RPT-2024-0133', details: 'Daily Processing Metrics sent to 3 recipients', ip: 'system' },
  { id: '17', timestamp: '2024-01-30 13:40:00', user: 'James Park', action: 'LOGIN', entityType: 'User', entityId: 'USR-005', details: 'Login from Safari on iOS', ip: '10.0.0.15' },
  { id: '18', timestamp: '2024-01-30 13:35:17', user: 'AI Agent', action: 'CREATED', entityType: 'Conversation', entityId: 'CONV-2024-0078', details: 'Auto-generated missing info request to GlobalTech Solutions', ip: 'system' },
  { id: '19', timestamp: '2024-01-30 13:30:00', user: 'Sarah Chen', action: 'APPROVED', entityType: 'PurchaseOrder', entityId: 'PO-2024-0289', details: 'PO approved: $34,500 for IT Services', ip: '192.168.1.105' },
  { id: '20', timestamp: '2024-01-30 13:25:00', user: 'Mike Johnson', action: 'DELETED', entityType: 'Invoice', entityId: 'INV-2024-001830', details: 'Duplicate invoice removed (original: INV-2024-001790)', ip: '192.168.1.112' },
];

export default function AuditPage() {
  const t = useT();
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockEntries.filter(e => {
    if (actionFilter !== 'All' && e.action !== actionFilter) return false;
    if (entityFilter !== 'All' && e.entityType !== entityFilter) return false;
    if (searchTerm && !e.user.toLowerCase().includes(searchTerm.toLowerCase()) && !e.details.toLowerCase().includes(searchTerm.toLowerCase()) && !e.entityId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('audit.title')}</h1>
          <p className={styles.subtitle}>{t('audit.subtitle')}</p>
        </div>
        <button className={styles.exportBtn}>{t('audit.exportLog')}</button>
      </div>

      <div className={styles.filters}>
        <input className={styles.filterInput} placeholder="Search users, details, IDs..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select className={styles.filterSelect} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="All">All Actions</option>
          {['CREATED', 'UPDATED', 'DELETED', 'APPROVED', 'REJECTED', 'LOGIN', 'EXPORT', 'CONFIGURED'].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className={styles.filterSelect} value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
          <option value="All">All Entities</option>
          {['Invoice', 'Payment', 'Supplier', 'User', 'Report', 'Setting', 'Workflow', 'RiskAlert', 'Expense', 'PurchaseOrder', 'Conversation'].map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr><th>{t('audit.timestamp')}</th><th>{t('audit.user')}</th><th>{t('audit.action')}</th><th>{t('audit.resource')}</th><th>ID</th><th>{t('audit.details')}</th><th>{t('audit.ipAddress')}</th></tr>
        </thead>
        <tbody>
          {filtered.map(entry => (
            <tr key={entry.id}>
              <td style={{ color: '#86909C', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.75rem' }}>{entry.timestamp}</td>
              <td style={{ whiteSpace: 'nowrap' }}>{entry.user}</td>
              <td><span className={`${styles.badge} ${actionColors[entry.action] || styles.badgeGray}`}>{entry.action}</span></td>
              <td style={{ color: '#86909C' }}>{entry.entityType}</td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#165DFF' }}>{entry.entityId}</td>
              <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.details}</td>
              <td style={{ color: '#4E5969', fontFamily: 'monospace', fontSize: '0.75rem' }}>{entry.ip}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {filtered.length} of {mockEntries.length} entries</span>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn}>Prev</button>
          <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
          <button className={styles.pageBtn}>Next</button>
        </div>
      </div>
    </div>
  );
}
