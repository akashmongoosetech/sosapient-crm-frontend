import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { useDeleteLead, useLeadFilterOptions, useLeads } from '../../services/leadService';
import { Button, PageHeader } from '../../components/ui/primitives';
import { Card } from '../../components/ui/primitives';
import { DeleteLeadModal } from './components/DeleteLeadModal';
import { LeadImportModal } from './components/LeadImportModal';
import { EMPTY_FILTERS, LeadFilters, type FilterState } from './components/LeadFilters';
import { LeadsTable } from './components/LeadsTable';
import type { Lead } from '../../types/lead';

const PAGE_SIZE = 20;

export default function LeadsListPage() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Lead | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(filters.q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [filters.q]);

  const params = useMemo(() => ({
    q: debouncedQ || undefined,
    category: filters.category || undefined,
    city: filters.city || undefined,
    contact: filters.contact,
    status: filters.status || undefined,
    page, limit: PAGE_SIZE,
  }), [debouncedQ, filters.category, filters.city, filters.contact, filters.status, page]);

  const list = useLeads(params);
  const options = useLeadFilterOptions();
  const del = useDeleteLead();

  function onFilters(f: FilterState) { setFilters(f); setPage(1); }

  function onConfirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true); setDeleteError('');
    del.mutate(deleting.id, {
      onSuccess: () => { setDeleteBusy(false); setDeleting(null); },
      onError: (e: Error) => { setDeleteBusy(false); setDeleteError(e.message); },
    });
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads"
        breadcrumb="Home / Leads"
        description="Track and manage every prospective customer."
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload size={16} aria-hidden /> Import JSON
            </Button>
            <Link to="/leads/new" className="inline-flex min-h-[2.5rem] items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
              <Plus size={16} aria-hidden /> Add Lead
            </Link>
          </>
        }
      />
      <LeadFilters
        filters={filters} onChange={onFilters}
        categories={options.data?.categories ?? []} cities={options.data?.cities ?? []}
        total={list.data?.total}
      />
      <LeadsTable leads={list.data?.leads ?? []} loading={list.isLoading} error={list.isError} onDelete={(l) => { setDeleting(l); setDeleteError(''); }} />
      {!list.isLoading && !list.isError && (list.data?.total ?? 0) > 0 && (
        <Card className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="min-h-0 px-3 py-1.5 text-xs">Prev</Button>
          <span className="text-slate-500">Page {list.data?.page} · {list.data?.total} total</span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={(list.data?.leads.length ?? 0) < PAGE_SIZE}
            className="min-h-0 px-3 py-1.5 text-xs"
          >
            Next
          </Button>
        </Card>
      )}
      <DeleteLeadModal
        open={!!deleting} leadName={deleting?.title ?? ''} deleting={deleteBusy} error={deleteError}
        onCancel={() => { if (!deleteBusy) setDeleting(null); }} onConfirm={onConfirmDelete}
      />
      <LeadImportModal open={importOpen} onClose={() => setImportOpen(false)} onImported={() => { setPage(1); }} />
    </div>
  );
}
