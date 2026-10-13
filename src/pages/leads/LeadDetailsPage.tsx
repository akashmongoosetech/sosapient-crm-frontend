import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ExternalLink, Pencil, Phone, Trash2 } from 'lucide-react';
import { useDeleteLead, useLead } from '../../services/leadService';
import { Badge, Button, Card, EmptyState, PageHeader, Skeleton } from '../../components/ui/primitives';
import { DeleteLeadModal } from './components/DeleteLeadModal';
import { STATUS_TONE } from '../../types/lead';

function fmtDateTime(iso: string): string {
  try { return new Date(iso).toLocaleString(); } catch { return '—'; }
}

function ensureUrl(website: string): string {
  return website.includes('://') ? website : `https://${website}`;
}

/** Recursive, crash-safe renderer for arbitrary preserved source data. Text only — never HTML. */
export function SourceValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) return <span className="text-slate-400">null</span>;
  if (typeof value === 'string') return <span className="break-words">{value === '' ? <span className="text-slate-400">(empty)</span> : value}</span>;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return <span>{String(value)}</span>;
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-slate-400">(empty list)</span>;
    return (
      <ul className="list-disc space-y-1 pl-5">
        {value.slice(0, 50).map((v, i) => <li key={i}><SourceValue value={v} /></li>)}
        {value.length > 50 && <li className="text-slate-400">…and {value.length - 50} more</li>}
      </ul>
    );
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-slate-400">(empty)</span>;
    return (
      <dl className="space-y-1.5">
        {entries.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[140px_1fr] gap-2 text-sm">
            <dt className="truncate font-medium text-slate-500">{k}</dt>
            <dd className="min-w-0 text-slate-700 dark:text-slate-300"><SourceValue value={v} /></dd>
          </div>
        ))}
      </dl>
    );
  }
  return <span>{String(value)}</span>;
}

const CORE_ROWS: { key: 'categoryName' | 'address' | 'city' | 'state' | 'placeId'; label: string }[] = [
  { key: 'categoryName', label: 'Category' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'placeId', label: 'Place ID' },
];

export default function LeadDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const lead = useLead(id);
  const del = useDeleteLead();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function onConfirmDelete() {
    if (!id) return;
    setBusy(true); setError('');
    del.mutate(id, {
      onSuccess: () => nav('/leads', { replace: true }),
      onError: (e: Error) => { setBusy(false); setError(e.message); },
    });
  }

  if (lead.isLoading) {
    return <Card className="space-y-3 p-6" aria-label="Loading lead"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-2/3" /></Card>;
  }
  if (lead.isError || !lead.data) {
    return <Card><EmptyState title="Lead not found" description="It may have been deleted." action={<Link to="/leads" className="text-sm font-semibold text-brand-600 hover:underline">Back to leads</Link>} /></Card>;
  }

  const l = lead.data;
  const sourceEntries = Object.entries(l.source || {});
  const phoneHref = (l.phoneUnformatted || l.phone).replace(/[^\d+]/g, '');

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title={l.title}
        breadcrumb="Home / Leads / Details"
        actions={
          <>
            <Link to={`/leads/${l.id}/edit`} className="inline-flex min-h-[2.5rem] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
              <Pencil size={16} aria-hidden /> Edit
            </Link>
            <Button variant="destructive" onClick={() => { setConfirmOpen(true); setError(''); }}>
              <Trash2 size={16} aria-hidden /> Delete
            </Button>
          </>
        }
      />
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
          {l.categoryName && <span className="text-sm text-slate-500">{l.categoryName}</span>}
        </div>
        <dl className="mt-4 space-y-3">
          {CORE_ROWS.map(({ key, label }) => (
            l[key] ? (
              <div key={key} className="grid grid-cols-[140px_1fr] gap-2 text-sm">
                <dt className="font-medium text-slate-500">{label}</dt>
                <dd className="text-slate-900 dark:text-slate-100">{l[key]}</dd>
              </div>
            ) : null
          ))}
          {(l.phone || l.phoneUnformatted) && (
            <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
              <dt className="font-medium text-slate-500">Phone</dt>
              <dd>
                <a href={`tel:${phoneHref}`} className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline">
                  <Phone size={14} aria-hidden /> {l.phone || l.phoneUnformatted}
                </a>
                {l.phone && l.phoneUnformatted && l.phone !== l.phoneUnformatted && (
                  <span className="block text-xs text-slate-500">{l.phoneUnformatted}</span>
                )}
              </dd>
            </div>
          )}
          {l.website && (
            <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
              <dt className="font-medium text-slate-500">Website</dt>
              <dd>
                <a href={ensureUrl(l.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline">
                  <ExternalLink size={14} aria-hidden /> {l.website}
                </a>
              </dd>
            </div>
          )}
          <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
            <dt className="font-medium text-slate-500">Created</dt>
            <dd className="text-slate-500">{fmtDateTime(l.createdAt)}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
            <dt className="font-medium text-slate-500">Updated</dt>
            <dd className="text-slate-500">{fmtDateTime(l.updatedAt)}</dd>
          </div>
        </dl>
      </Card>
      {sourceEntries.length > 0 && (
        <Card className="p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Additional imported data</h2>
          <p className="mt-0.5 text-xs text-slate-500">Preserved exactly as supplied by the source file.</p>
          <div className="mt-3 rounded-lg bg-slate-50 p-4 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:ring-slate-700">
            <SourceValue value={l.source} />
          </div>
        </Card>
      )}
      <DeleteLeadModal open={confirmOpen} leadName={l.title} deleting={busy} error={error} onCancel={() => { if (!busy) setConfirmOpen(false); }} onConfirm={onConfirmDelete} />
    </div>
  );
}
