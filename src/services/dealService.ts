import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch, apiUpload } from './apiClient';
import type { ApiEnvelope } from '../types';
import type { Deal, DealEntry, DealListResponse, EntryKind, EntryListResponse } from '../types/deal';

export const dealKeys = {
  list: (q: string, page: number) => ['deals', 'list', q, page] as const,
  detail: (id: string) => ['deals', 'detail', id] as const,
  entries: (id: string, kind: EntryKind, page: number) => ['deals', id, kind, page] as const,
};

export function useDeals(q: string, page: number, limit = 20) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', String(page));
  params.set('limit', String(limit));
  return useQuery({
    queryKey: dealKeys.list(q, page),
    queryFn: () => apiFetch<ApiEnvelope<DealListResponse>>(`/deals?${params}`).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: dealKeys.detail(id || ''),
    queryFn: () => apiFetch<ApiEnvelope<{ deal: Deal }>>(`/deals/${id}`).then((r) => r.data.deal),
    enabled: !!id,
  });
}

export function useEntries(dealId: string | undefined, kind: EntryKind, page = 1, limit = 20) {
  return useQuery({
    queryKey: dealKeys.entries(dealId || '', kind, page),
    queryFn: () =>
      apiFetch<ApiEnvelope<EntryListResponse>>(`/deals/${dealId}/${kind === 'requirement' ? 'requirements' : 'progress'}?page=${page}&limit=${limit}`).then((r) => r.data),
    enabled: !!dealId,
  });
}

export interface EntryInput {
  description: string;
  entryDate: string; // yyyy-mm-dd
  files: File[];
}

const KIND_PATH: Record<EntryKind, string> = { requirement: 'requirements', progress: 'progress' };

export function useSaveEntry(dealId: string, kind: EntryKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: EntryInput) => {
      const form = new FormData();
      form.set('description', input.description);
      form.set('entryDate', input.entryDate);
      for (const f of input.files) form.append('attachments', f, f.name);
      return apiUpload<ApiEnvelope<{ entry: DealEntry }>>(`/deals/${dealId}/${KIND_PATH[kind]}`, form).then((r) => r.data.entry);
    },
    onSuccess: () => {
      toast.success(kind === 'requirement' ? 'Requirement saved' : 'Progress saved');
      qc.invalidateQueries({ queryKey: ['deals', dealId] });
      qc.invalidateQueries({ queryKey: ['deals', 'list'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateEntry(dealId: string, kind: EntryKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ entryId, description, entryDate, keepAttachments }: { entryId: string; description?: string; entryDate?: string; keepAttachments?: string[] }) =>
      apiFetch<ApiEnvelope<{ entry: DealEntry }>>(`/deals/${dealId}/${KIND_PATH[kind]}/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify({ description, entryDate, keepAttachments }),
      }).then((r) => r.data.entry),
    onSuccess: () => {
      toast.success('Entry updated');
      qc.invalidateQueries({ queryKey: ['deals', dealId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteEntry(dealId: string, kind: EntryKind) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) =>
      apiFetch<ApiEnvelope<{}>>(`/deals/${dealId}/${KIND_PATH[kind]}/${entryId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Entry deleted');
      qc.invalidateQueries({ queryKey: ['deals', dealId] });
      qc.invalidateQueries({ queryKey: ['deals', 'list'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
