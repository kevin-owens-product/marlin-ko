'use client';

import React, { useState, useMemo, useCallback } from 'react';
import styles from './DataTable.module.css';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pagination?: boolean;
  pageSize?: number;
  loading?: boolean;
  loadingRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  toolbarActions?: React.ReactNode;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string | null;
  direction: SortDirection;
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys,
  pagination = false,
  pageSize = 10,
  loading = false,
  loadingRows = 5,
  emptyTitle = 'No data found',
  emptyDescription = 'There are no records to display.',
  emptyIcon,
  onRowClick,
  toolbarActions,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortState>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    const keys = searchKeys || columns.map((c) => c.key);
    return data.filter((row) =>
      keys.some((key) => {
        const val = getNestedValue(row, key);
        return val !== null && val !== undefined && String(val).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchKeys, columns]);

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = getNestedValue(a, sort.key!);
      const bVal = getNestedValue(b, sort.key!);
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sort.direction === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredData, sort]);

  const totalPages = pagination ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = useCallback((key: string) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return { key: null, direction: null };
    });
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const renderSortIcon = (columnKey: string) => {
    const isActive = sort.key === columnKey;
    return (
      <span className={`${styles.sortIcon} ${isActive ? styles.sortIconActive : ''}`} aria-hidden="true">
        <span style={{ opacity: isActive && sort.direction === 'desc' ? 0.3 : undefined }}>&#9650;</span>
        <span style={{ opacity: isActive && sort.direction === 'asc' ? 0.3 : undefined }}>&#9660;</span>
      </span>
    );
  };

  const renderLoadingSkeleton = () => (
    <>
      {Array.from({ length: loadingRows }).map((_, rowIdx) => (
        <tr key={`skeleton-${rowIdx}`} className={styles.skeletonRow}>
          {columns.map((col) => (
            <td key={col.key}>
              <div
                className={styles.skeletonCell}
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  const renderEmptyState = () => (
    <tr>
      <td colSpan={columns.length}>
        <div className={styles.emptyState} role="status">
          {emptyIcon && <div className={styles.emptyIcon}>{emptyIcon}</div>}
          <div className={styles.emptyTitle}>{emptyTitle}</div>
          <div className={styles.emptyDescription}>{emptyDescription}</div>
        </div>
      </td>
    </tr>
  );

  const renderPagination = () => {
    if (!pagination || sortedData.length === 0) return null;
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, sortedData.length);

    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination} role="navigation" aria-label="Table pagination">
        <div className={styles.pageInfo}>
          Showing {startItem}-{endItem} of {sortedData.length}
        </div>
        <div className={styles.pageControls}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            &#171;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            &#8249;
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ''}`}
              onClick={() => setCurrentPage(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            &#8250;
          </button>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            &#187;
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.wrapper} ${className || ''}`} role="region" aria-label="Data table">
      {(searchable || toolbarActions) && (
        <div className={styles.toolbar}>
          {searchable && (
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon} aria-hidden="true">&#128269;</span>
              <input
                type="text"
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search table"
              />
            </div>
          )}
          {toolbarActions && <div>{toolbarActions}</div>}
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table} role="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  aria-sort={
                    sort.key === col.key
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  {col.sortable ? (
                    <span
                      className={styles.sortableHeader}
                      onClick={() => handleSort(col.key)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSort(col.key);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header}
                      {renderSortIcon(col.key)}
                    </span>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? renderLoadingSkeleton()
              : paginatedData.length === 0
              ? renderEmptyState()
              : paginatedData.map((row, idx) => (
                  <tr
                    key={keyExtractor(row, idx)}
                    className={onRowClick ? styles.clickableRow : undefined}
                    onClick={onRowClick ? () => onRowClick(row, idx) : undefined}
                    onKeyDown={
                      onRowClick
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              onRowClick(row, idx);
                            }
                          }
                        : undefined
                    }
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                  >
                    {columns.map((col) => (
                      <td key={col.key}>
                        {col.render
                          ? col.render(getNestedValue(row, col.key), row, idx)
                          : (getNestedValue(row, col.key) as React.ReactNode) ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}
    </div>
  );
}
