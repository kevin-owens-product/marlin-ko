'use client';

import React, { useState } from 'react';
import styles from './Avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0);
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0);
}

const statusSizeClass: Record<AvatarSize, string> = {
  xs: styles.statusXs,
  sm: styles.statusSm,
  md: styles.statusMd,
  lg: styles.statusLg,
  xl: styles.statusXl,
};

const statusColorClass: Record<AvatarStatus, string> = {
  online: styles.statusOnline,
  offline: styles.statusOffline,
  busy: styles.statusBusy,
  away: styles.statusAway,
};

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  status,
  className,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : '?';

  return (
    <div
      className={`${styles.wrapper} ${styles[size]} ${className || ''}`}
      role="img"
      aria-label={alt || name || 'Avatar'}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImgError(true)}
        />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {initials}
        </span>
      )}
      {status && (
        <span
          className={`${styles.statusIndicator} ${statusSizeClass[size]} ${statusColorClass[status]}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
