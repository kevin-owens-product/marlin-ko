'use client';

import React, { useMemo } from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount?: number;
  pageSize?: number;
}

function getPageNumbers(page: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];

  // Always show first page
  pages.push(1);

  if (page > 3) {
    pages.push('ellipsis');
  }

  // Pages around current
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (page < totalPages - 2) {
    pages.push('ellipsis');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalCount,
  pageSize,
}: PaginationProps) {
  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  if (totalPages <= 1) return null;

  const showingFrom = totalCount && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const showingTo = totalCount && pageSize ? Math.min(page * pageSize, totalCount) : undefined;

  return (
    <nav className={styles.container} role="navigation" aria-label="Pagination">
      {totalCount !== undefined && showingFrom !== undefined && showingTo !== undefined && (
        <div className={styles.info} aria-live="polite">
          Showing {showingFrom}-{showingTo} of {totalCount}
        </div>
      )}

      <div className={styles.controls}>
        <button
          className={[styles.button, styles.navButton].join(' ')}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
          type="button"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span className={styles.navLabel}>Previous</span>
        </button>

        <div className={styles.pages}>
          {pageNumbers.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
                  ...
                </span>
              );
            }

            return (
              <button
                key={item}
                className={[
                  styles.button,
                  styles.pageButton,
                  item === page ? styles.pageActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onPageChange(item)}
                aria-label={`Go to page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                type="button"
              >
                {item}
              </button>
            );
          })}
        </div>

        <button
          className={[styles.button, styles.navButton].join(' ')}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Go to next page"
          type="button"
        >
          <span className={styles.navLabel}>Next</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
