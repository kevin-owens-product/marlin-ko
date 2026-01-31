'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface UseCRUDOptions {
  endpoint: string;
  pageSize?: number;
  autoFetch?: boolean;
  defaultParams?: Record<string, string>;
}

export interface UseCRUDReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchAll: (params?: Record<string, string>) => Promise<void>;
  create: (item: Partial<T>) => Promise<T | null>;
  update: (id: string, item: Partial<T>) => Promise<T | null>;
  remove: (id: string) => Promise<boolean>;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useCRUD<T extends { id: string }>(options: UseCRUDOptions): UseCRUDReturn<T> {
  const { endpoint, pageSize = 50, autoFetch = true, defaultParams } = options;
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const abortRef = useRef<AbortController | null>(null);
  const defaultParamsRef = useRef(defaultParams);
  defaultParamsRef.current = defaultParams;

  const fetchAll = useCallback(async (params?: Record<string, string>) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const merged = { limit: String(pageSize), ...defaultParamsRef.current, ...params };
      const qs = new URLSearchParams(merged).toString();
      const res = await fetch(`${endpoint}?${qs}`, { signal: controller.signal });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch (${res.status})`);
      }
      const json = await res.json();
      setData(json.data ?? []);
      if (json.pagination) setPagination(json.pagination);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unknown error');
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [endpoint, pageSize]);

  useEffect(() => {
    if (autoFetch) fetchAll();
    return () => abortRef.current?.abort();
  }, [autoFetch, fetchAll]);

  const create = useCallback(async (item: Partial<T>): Promise<T | null> => {
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to create (${res.status})`);
      }
      const json = await res.json();
      const created = json.data as T;
      setData((prev) => [created, ...prev]);
      setPagination((prev) => ({ ...prev, totalCount: prev.totalCount + 1 }));
      return created;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    }
  }, [endpoint]);

  const update = useCallback(async (id: string, item: Partial<T>): Promise<T | null> => {
    setError(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to update (${res.status})`);
      }
      const json = await res.json();
      const updated = json.data as T;
      setData((prev) => prev.map((d) => (d.id === id ? updated : d)));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    }
  }, [endpoint]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to delete (${res.status})`);
      }
      setData((prev) => prev.filter((d) => d.id !== id));
      setPagination((prev) => ({ ...prev, totalCount: Math.max(0, prev.totalCount - 1) }));
      return true;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return false;
    }
  }, [endpoint]);

  return { data, loading, error, pagination, fetchAll, create, update, remove, setData };
}
