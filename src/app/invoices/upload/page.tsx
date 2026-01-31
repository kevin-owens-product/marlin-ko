'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useT } from '@/lib/i18n/locale-context';
import styles from './upload.module.css';

interface UploadFile {
  name: string;
  size: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'failed';
}

const mockUploading: UploadFile[] = [
  { name: 'invoice-acme-jan2024.pdf', size: '2.4 MB', progress: 100, status: 'complete' },
  { name: 'supplier-receipt-7834.pdf', size: '1.1 MB', progress: 72, status: 'uploading' },
];

const recentUploads = [
  { name: 'INV-GlobalTech-Q4-2023.pdf', date: 'Jan 28, 2024 at 2:15 PM', invoiceNumber: 'INV-2024-001846', status: 'complete' as const },
  { name: 'receipt-nordic-supplies.png', date: 'Jan 28, 2024 at 1:42 PM', invoiceNumber: 'INV-2024-001845', status: 'processing' as const },
  { name: 'shanghai-electronics-order.xml', date: 'Jan 27, 2024 at 4:30 PM', invoiceNumber: 'INV-2024-001844', status: 'complete' as const },
  { name: 'baxter-medical-inv.pdf', date: 'Jan 27, 2024 at 3:12 PM', invoiceNumber: 'INV-2024-001843', status: 'failed' as const },
  { name: 'mexiparts-purchase-order.pdf', date: 'Jan 26, 2024 at 11:05 AM', invoiceNumber: 'INV-2024-001842', status: 'complete' as const },
];

const supportedFormats = ['PDF', 'PNG', 'JPG', 'XML', 'UBL', 'Peppol'];

export default function UploadInvoicePage() {
  const t = useT();
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div className={styles.page}>
      <Link href="/invoices">
        <button className={styles.backLink}>
          &#8592; {t('invoiceDetail.backToInvoices')}
        </button>
      </Link>

      <div className={styles.header}>
        <h1>{t('invoiceUpload.title')}</h1>
        <p>{t('invoiceUpload.subtitle')}</p>
      </div>

      {/* Drag & Drop Zone */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Upload Documents</span>
        </div>
        <div className={styles.cardBody}>
          <div
            className={`${styles.dropzone} ${isDragOver ? styles.dropzoneActive : ''}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
          >
            <div className={styles.dropzoneIcon}>&#128228;</div>
            <div className={styles.dropzoneTitle}>
              {isDragOver ? 'Drop files here' : t('invoiceUpload.dragAndDrop')}
            </div>
            <div className={styles.dropzoneSubtitle}>or click to browse from your computer</div>
            <button className={styles.dropzoneBrowseBtn}>Browse Files</button>
            <div className={styles.formats}>
              {supportedFormats.map((fmt) => (
                <span key={fmt} className={styles.formatTag}>{fmt}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>{t('invoiceUpload.aiProcessing')}</span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.progressSection}>
            {mockUploading.map((file, i) => (
              <div key={i} className={styles.progressItem}>
                <div className={styles.progressFileIcon}>&#128196;</div>
                <div className={styles.progressInfo}>
                  <div className={styles.progressFileName}>{file.name}</div>
                  <div className={styles.progressMeta}>{file.size}</div>
                  <div className={styles.progressBarTrack}>
                    <div
                      className={`${styles.progressBarFill} ${file.status === 'complete' ? styles.progressBarComplete : ''}`}
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
                <div className={`${styles.progressPercent} ${file.status === 'complete' ? styles.progressComplete : ''}`}>
                  {file.status === 'complete' ? 'Complete' : `${file.progress}%`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span>OR</span>
        <div className={styles.dividerLine} />
      </div>

      {/* Quick Entry Form */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Quick Entry Form</span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Invoice Number</label>
              <input type="text" className={styles.formInput} placeholder="INV-2024-XXXXXX" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('invoiceDetail.supplier')}</label>
              <select className={styles.formSelect}>
                <option value="">Select supplier...</option>
                <option>Acme Corporation</option>
                <option>GlobalTech Solutions</option>
                <option>Nordic Supplies AB</option>
                <option>Shanghai Electronics Co</option>
                <option>Baxter Medical Ltd</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('invoiceDetail.amount')}</label>
              <input type="number" className={styles.formInput} placeholder="0.00" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Currency</label>
              <select className={styles.formSelect}>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="SEK">SEK - Swedish Krona</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('invoiceDetail.invoiceDate')}</label>
              <input type="date" className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('invoiceDetail.dueDate')}</label>
              <input type="date" className={styles.formInput} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('invoiceDetail.poNumber')}</label>
              <input type="text" className={styles.formInput} placeholder="PO-2024-XXXXXX" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t('invoiceDetail.department')}</label>
              <select className={styles.formSelect}>
                <option value="">Select department...</option>
                <option>Engineering</option>
                <option>Marketing</option>
                <option>Operations</option>
                <option>Finance</option>
                <option>Human Resources</option>
              </select>
            </div>
            <div className={styles.formGroupFull}>
              <label className={styles.formLabel}>{t('common.description')}</label>
              <input type="text" className={styles.formInput} placeholder="Brief description of the invoice..." />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.btnSecondary}>{t('common.cancel')}</button>
            <button className={styles.btnPrimary}>{t('invoiceUpload.uploadBtn')}</button>
          </div>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Recent Uploads</span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.recentUploads}>
            {recentUploads.map((upload, i) => (
              <div key={i} className={styles.recentItem}>
                <div className={styles.recentLeft}>
                  <span className={styles.recentIcon}>&#128196;</span>
                  <div className={styles.recentInfo}>
                    <span className={styles.recentName}>{upload.name}</span>
                    <span className={styles.recentMeta}>{upload.date} -- {upload.invoiceNumber}</span>
                  </div>
                </div>
                <span className={`${styles.recentStatus} ${
                  upload.status === 'complete' ? styles.recentComplete :
                  upload.status === 'processing' ? styles.recentProcessing :
                  styles.recentFailed
                }`}>
                  {upload.status === 'complete' ? 'Processed' :
                   upload.status === 'processing' ? 'Processing' : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
