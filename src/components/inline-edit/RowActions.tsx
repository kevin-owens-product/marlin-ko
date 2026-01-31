'use client';

import React from 'react';
import { useT } from '@/lib/i18n/locale-context';
import styles from './RowActions.module.css';

export interface RowActionsProps {
  mode: 'read' | 'editing' | 'creating' | 'deleting';
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
  saving?: boolean;
}

export function RowActions({
  mode,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onConfirmDelete,
  onCancelDelete,
  saving,
}: RowActionsProps) {
  const t = useT();

  if (mode === 'deleting') {
    return (
      <div className={styles.actions}>
        <span className={styles.confirmText}>{t('common.confirmDelete')}</span>
        <button className={`${styles.btn} ${styles.btnDangerConfirm}`} onClick={onConfirmDelete}>
          {t('common.yes')}
        </button>
        <button className={styles.btn} onClick={onCancelDelete}>
          {t('common.no')}
        </button>
      </div>
    );
  }

  if (mode === 'editing' || mode === 'creating') {
    return (
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onSave}
          disabled={saving}
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
        <button className={styles.btn} onClick={onCancel} disabled={saving}>
          {t('common.cancel')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <button className={styles.btn} onClick={onEdit}>
        {t('common.edit')}
      </button>
      <button className={`${styles.btn} ${styles.btnDanger}`} onClick={onDelete}>
        {t('common.delete')}
      </button>
    </div>
  );
}
