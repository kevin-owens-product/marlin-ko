'use client';

import React from 'react';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'circle' | 'rect';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) {
  const style: React.CSSProperties = {};

  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (variant === 'circle') {
    const size = width || height || 40;
    style.width = typeof size === 'number' ? `${size}px` : size;
    style.height = style.width;
  }

  if (variant === 'text' && !height) {
    style.height = '0.875rem';
  }

  if (!width && variant === 'text') {
    style.width = '100%';
  }

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className || ''}`}
      style={style}
      role="presentation"
      aria-hidden="true"
    />
  );
}
