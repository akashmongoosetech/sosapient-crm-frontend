import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiFetch } from './apiClient';
import type { ApiEnvelope } from '../types';
import type { ImportPreview, ImportResult, Lead, LeadFilterOptions, LeadListParams, LeadListResponse } from '../types/lead';

function toQuery(params: LeadListParams): string {
  const sp = new URLSearchParams();
  if (params.q) sp.set('q', params.q);
  if (params.category) sp.set('category', params.category);
  if (params.city) sp.set('city', params.city);
  if (params.status) sp.set('status', params.status);
  if (params.contact && params.contact !== 'all') sp.set('contact', params.contact);
  sp.set('page', String(params.page || 1));
  sp.set('limit', String(params.limit || 20));
  return sp.toString();
}

export const leadKeys = {
  list: (p: LeadListParams) => ['leads', 'list', p] as const,
  detail: (id: string) => ['leads', 'detail', id] as const,
  filters: ['leads', 'filters'] as const,
};

export function useLeads(params: LeadListParams) {
  return useQuery({
    queryKey: leadKeys.list(params),
    queryFn: () => apiFetch<ApiEnvelope<LeadListResponse>>(`/leads?${toQuery(params)}`).then((r) => r.data),
    placeholderData: keepPreviousData,
  });
}

export function useLead(id: string | undefined) {
  return useQuery({
    queryKey: leadKeys.detail(id || ''),
    queryFn: () => apiFetch<ApiEnvelope<{ lead: Lead }>>(`/leads/${id}`).then((r) => r.data.lead),
    enabled: !!id,
  });
}

export function useLeadFilterOptions() {
  return useQuery({
    queryKey: leadKeys.filters,
    queryFn: () => apiFetch<ApiEnvelope<LeadFilterOptions>>('/leads/filters').then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<ApiEnvelope<{ lead: Lead }>>('/leads', { method: 'POST', body: JSON.stringify(body) }).then((r) => r.data.lead),
    onSuccess: () => {
      toast.success('Lead created');
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export type UpdateLeadResult = { lead: Lead } | { converted: true; deal: import('../types/deal').Deal };

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch<ApiEnvelope<{ lead?: Lead; converted?: true; deal?: import('../types/deal').Deal }>>(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(body) }).then((r) => {
        if (r.data.converted && r.data.deal) return { converted: true as const, deal: r.data.deal };
        return { lead: r.data.lead as Lead };
      }),
    onSuccess: (data) => {
      if ('converted' in data) {
        toast.success('Lead converted to deal');
      } else {
        toast.success('Lead updated');
      }
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['deals'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<ApiEnvelope<{}>>(`/leads/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Lead deleted');
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useImportPreview() {
  return useMutation({
    mutationFn: (records: unknown[]) =>
      apiFetch<ApiEnvelope<ImportPreview>>('/leads/import/preview', { method: 'POST', body: JSON.stringify({ records }) }, false).then((r) => r.data),
  });
}

export function useImportConfirm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (records: unknown[]) =>
      apiFetch<ApiEnvelope<ImportResult>>('/leads/import/confirm', { method: 'POST', body: JSON.stringify({ records }) }, false).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
