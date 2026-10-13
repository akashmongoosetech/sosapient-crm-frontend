import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Badge, Card, EmptyState, Skeleton, TableShell } from '../../../components/ui/primitives';
import { Avatar } from '../../../components/common/Avatar';
import { STATUS_TONE, type Lead } from '../../../types/lead';

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return '—'; }
}

function hostOf(website: string): string {
  try {
    const u = new URL(website.includes('://') ? website : `https://${website}`);
    return u.hostname.replace(/^www\./, '');
  } catch { return website; }
}

export function LeadsTable({ leads, loading, error, onDelete }: {
  leads: Lead[];
  loading: boolean;
  error: boolean;
  onDelete: (lead: Lead) => void;
}) {
  if (loading) {
    return (
      <Card className="space-y-3 p-5" aria-label="Loading leads">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </Card>
    );
  }
  if (error) {
    return <Card><EmptyState title="Could not load leads" description="Something went wrong. Please try again." /></Card>;
  }
  if (leads.length === 0) {
    return <Card><EmptyState title="No leads found" description="Try adjusting search or filters — or add your first lead." /></Card>;
  }
  return (
    <Card>
      <TableShell label="Leads">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <th scope="col" className="px-4 py-3">Lead</th>
              <th scope="col" className="px-4 py-3">Category</th>
              <th scope="col" className="px-4 py-3">City / State</th>
              <th scope="col" className="px-4 py-3">Contact</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Created</th>
              <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                <td className="max-w-[220px] px-4 py-3">
                  <span className="flex items-center gap-2.5">
                    <Avatar url="" name={l.title} size={34} />
                    <Link to={`/leads/${l.id}`} className="truncate font-semibold text-slate-900 hover:text-brand-700 hover:underline dark:text-slate-100">{l.title}</Link>
                  </span>
                </td>
                <td className="max-w-[160px] truncate px-4 py-3 text-slate-500">{l.categoryName || '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{[l.city, l.state].filter(Boolean).join(', ') || '—'}</td>
                <td className="max-w-[200px] px-4 py-3 text-slate-500">
                  <span className="block truncate">{l.phone || l.phoneUnformatted || '—'}</span>
                  {l.website && <span className="block truncate text-xs text-brand-600">{hostOf(l.website)}</span>}
                </td>
                <td className="px-4 py-3"><Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(l.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className="flex gap-1">
                    <Link to={`/leads/${l.id}`} aria-label={`View ${l.title}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"><Eye size={17} aria-hidden /></Link>
                    <Link to={`/leads/${l.id}/edit`} aria-label={`Edit ${l.title}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700"><Pencil size={17} aria-hidden /></Link>
                    <button type="button" onClick={() => onDelete(l)} aria-label={`Delete ${l.title}`} className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700">
                      <Trash2 size={17} aria-hidden />
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </Card>
  );
}

