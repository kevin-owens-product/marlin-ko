'use client';

import { useState, useEffect } from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './portal-documents.module.css';

/* ───────── Types ───────── */

type DocStatus = 'verified' | 'expiring' | 'required' | 'expired';

interface RequiredDoc {
  id: string;
  nameKey: string;
  status: DocStatus;
  statusLabel: string;
  icon: string;
}

interface UploadedDoc {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  expiry: string;
  status: DocStatus;
}

/* ───────── Mock Data ───────── */

const requiredDocs: RequiredDoc[] = [
  {
    id: 'rd-1',
    nameKey: 'supplierPortal.documents.w9TaxForm',
    status: 'verified',
    statusLabel: 'Verified',
    icon: '\u2705',
  },
  {
    id: 'rd-2',
    nameKey: 'supplierPortal.documents.certificateOfInsurance',
    status: 'expiring',
    statusLabel: 'Expiring Mar 8, 2026',
    icon: '\u26A0',
  },
  {
    id: 'rd-3',
    nameKey: 'supplierPortal.documents.bankDetailsVerification',
    status: 'required',
    statusLabel: 'Required',
    icon: '\u274C',
  },
  {
    id: 'rd-4',
    nameKey: 'supplierPortal.documents.businessLicense',
    status: 'verified',
    statusLabel: 'Verified',
    icon: '\u2705',
  },
];

const uploadedDocs: UploadedDoc[] = [
  { id: 'ud-1', name: 'W-9_AcmeCorp_2026.pdf', type: 'Tax Form', uploadedDate: '2026-01-05', expiry: '2026-12-31', status: 'verified' },
  { id: 'ud-2', name: 'COI_AcmeCorp_2025.pdf', type: 'Insurance', uploadedDate: '2025-03-15', expiry: '2026-03-08', status: 'expiring' },
  { id: 'ud-3', name: 'BusinessLicense_TX_2025.pdf', type: 'License', uploadedDate: '2025-06-20', expiry: '2027-06-20', status: 'verified' },
  { id: 'ud-4', name: 'ISO9001_Certificate.pdf', type: 'Certification', uploadedDate: '2025-04-12', expiry: '2027-03-15', status: 'verified' },
  { id: 'ud-5', name: 'SOC2_TypeII_Report.pdf', type: 'Certification', uploadedDate: '2025-09-01', expiry: '2026-09-01', status: 'verified' },
  { id: 'ud-6', name: 'BankVerification_Chase.pdf', type: 'Banking', uploadedDate: '2024-11-10', expiry: '2025-11-10', status: 'expired' },
];

/* ───────── Helpers ───────── */

const statusIconClass: Record<DocStatus, string> = {
  verified: styles.iconVerified,
  expiring: styles.iconWarning,
  required: styles.iconRequired,
  expired: styles.iconRequired,
};

const statusTextClass: Record<DocStatus, string> = {
  verified: styles.statusVerified,
  expiring: styles.statusExpiring,
  required: styles.statusMissing,
  expired: styles.statusMissing,
};

const badgeClass: Record<DocStatus, string> = {
  verified: styles.badgeVerified,
  expiring: styles.badgeExpiring,
  required: styles.badgePending,
  expired: styles.badgeExpired,
};

const badgeLabel: Record<DocStatus, string> = {
  verified: 'Verified',
  expiring: 'Expiring Soon',
  required: 'Required',
  expired: 'Expired',
};

/* ───────── Component ───────── */

export default function SupplierPortalDocuments() {
  const t = useT();
  const [loading, setLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    /* In production, handle file upload here */
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={`${styles.skeleton} ${styles.skeletonCards}`} />
        <div className={`${styles.skeleton} ${styles.skeletonUpload}`} />
        <div className={`${styles.skeleton} ${styles.skeletonTable}`} />
      </div>
    );
  }

  return (
    <>
      {/* ── Page Header ── */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('supplierPortal.documents.title')}</h1>
      </div>

      {/* ── Required Documents ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('supplierPortal.documents.requiredDocuments')}</h2>
        <div className={styles.requiredGrid}>
          {requiredDocs.map((doc) => (
            <div key={doc.id} className={styles.requiredCard}>
              <div className={styles.requiredInfo}>
                <div className={`${styles.requiredIcon} ${statusIconClass[doc.status]}`}>
                  {doc.icon}
                </div>
                <div>
                  <div className={styles.requiredName}>{t(doc.nameKey)}</div>
                  <div className={`${styles.requiredStatus} ${statusTextClass[doc.status]}`}>
                    {doc.statusLabel}
                  </div>
                </div>
              </div>
              <button
                className={`${styles.uploadSmallButton} ${
                  doc.status === 'required' ? styles.uploadSmallButtonRequired : ''
                }`}
              >
                {doc.status === 'required'
                  ? t('supplierPortal.documents.upload')
                  : t('supplierPortal.documents.reupload')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Drag-and-Drop Upload Zone ── */}
      <div
        className={`${styles.uploadZone} ${isDragOver ? styles.uploadZoneActive : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label={t('supplierPortal.documents.dragDrop')}
      >
        <div className={styles.uploadZoneIcon}>&#128206;</div>
        <div className={styles.uploadZoneTitle}>{t('supplierPortal.documents.dragDrop')}</div>
        <div className={styles.uploadZoneSubtitle}>{t('supplierPortal.documents.orClickToUpload')}</div>
        <div className={styles.uploadZoneFormats}>{t('supplierPortal.documents.acceptedFormats')}</div>
        <div className={styles.uploadZoneMax}>{t('supplierPortal.documents.maxSize')}</div>
      </div>

      {/* ── Uploaded Documents Table ── */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('supplierPortal.documents.uploadedDocuments')}</h2>
        <div className={styles.tableWrapper}>
          {uploadedDocs.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>&#128196;</div>
              <div className={styles.emptyTitle}>{t('supplierPortal.documents.noDocuments')}</div>
              <div className={styles.emptyDesc}>{t('supplierPortal.documents.noDocumentsDesc')}</div>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('supplierPortal.documents.documentName')}</th>
                  <th>{t('supplierPortal.documents.type')}</th>
                  <th>{t('supplierPortal.documents.uploadedDate')}</th>
                  <th>{t('supplierPortal.documents.expiry')}</th>
                  <th>{t('supplierPortal.documents.status')}</th>
                  <th>{t('supplierPortal.documents.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {uploadedDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <span className={styles.docName}>{doc.name}</span>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>{doc.type}</span>
                    </td>
                    <td>{doc.uploadedDate}</td>
                    <td>{doc.expiry}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${badgeClass[doc.status]}`}>
                        {badgeLabel[doc.status]}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button className={styles.actionButton}>
                          {t('supplierPortal.documents.preview')}
                        </button>
                        <button className={styles.actionButton}>
                          {t('supplierPortal.documents.download')}
                        </button>
                        <button className={`${styles.actionButton} ${styles.actionButtonDanger}`}>
                          {t('supplierPortal.documents.delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
