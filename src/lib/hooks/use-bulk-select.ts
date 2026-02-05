'use client';

import { useState, useCallback, useMemo } from 'react';

export interface UseBulkSelectReturn {
  selected: Set<string>;
  toggle: (id: string) => void;
  toggleAll: (allIds: string[]) => void;
  clear: () => void;
  allSelected: (allIds: string[]) => boolean;
  someSelected: boolean;
  count: number;
}

export function useBulkSelect(): UseBulkSelectReturn {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAll = useCallback((allIds: string[]) => {
    setSelected((prev) => {
      const allCurrentlySelected = allIds.length > 0 && allIds.every((id) => prev.has(id));
      if (allCurrentlySelected) {
        return new Set();
      }
      return new Set(allIds);
    });
  }, []);

  const clear = useCallback(() => {
    setSelected(new Set());
  }, []);

  const allSelected = useCallback(
    (allIds: string[]) => allIds.length > 0 && allIds.every((id) => selected.has(id)),
    [selected]
  );

  const someSelected = selected.size > 0;
  const count = selected.size;

  return { selected, toggle, toggleAll, clear, allSelected, someSelected, count };
}
