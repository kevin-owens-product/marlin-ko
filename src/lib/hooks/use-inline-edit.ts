'use client';

import { useState, useCallback } from 'react';

export interface UseInlineEditReturn<T> {
  editingId: string | null;
  editDraft: Partial<T>;
  isCreating: boolean;
  createDraft: Partial<T>;
  deleteConfirmId: string | null;
  startEdit: (id: string, current: T) => void;
  updateEditField: (field: keyof T, value: any) => void;
  cancelEdit: () => void;
  startCreate: (defaults?: Partial<T>) => void;
  updateCreateField: (field: keyof T, value: any) => void;
  cancelCreate: () => void;
  requestDelete: (id: string) => void;
  cancelDelete: () => void;
}

export function useInlineEdit<T extends { id: string }>(): UseInlineEditReturn<T> {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<T>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Partial<T>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startEdit = useCallback((id: string, current: T) => {
    setIsCreating(false);
    setCreateDraft({});
    setDeleteConfirmId(null);
    setEditingId(id);
    setEditDraft({ ...current });
  }, []);

  const updateEditField = useCallback((field: keyof T, value: any) => {
    setEditDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditDraft({});
  }, []);

  const startCreate = useCallback((defaults?: Partial<T>) => {
    setEditingId(null);
    setEditDraft({});
    setDeleteConfirmId(null);
    setIsCreating(true);
    setCreateDraft(defaults ?? {});
  }, []);

  const updateCreateField = useCallback((field: keyof T, value: any) => {
    setCreateDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const cancelCreate = useCallback(() => {
    setIsCreating(false);
    setCreateDraft({});
  }, []);

  const requestDelete = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  return {
    editingId,
    editDraft,
    isCreating,
    createDraft,
    deleteConfirmId,
    startEdit,
    updateEditField,
    cancelEdit,
    startCreate,
    updateCreateField,
    cancelCreate,
    requestDelete,
    cancelDelete,
  };
}
