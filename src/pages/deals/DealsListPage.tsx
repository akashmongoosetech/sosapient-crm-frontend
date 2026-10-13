import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { useDeals } from '../../services/dealService';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Skeleton, TableShell } from '../../components/ui/primitives';
import { Avatar } from '../../components/common/Avatar';

const PAGE_SIZE = 20;

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return '—'; }
}

export default function DealsListPage() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const list = useDeals(debouncedQ, page, PAGE_SIZE);
  const deals = list.data?.deals ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Deals"
        breadcrumb="Home / Deals"
        description="Converted leads, with day-by-day client requirements and project progress."
      />
      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search deals by name, city, phone…" aria-label="Search deals" className="pl-9" />
        </div>
      </Card>

      {list.isLoading ? (
        <Card className="space-y-3 p-5" aria-label="Loading deals"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></Card>
      ) : list.isError ? (
        <Card><EmptyState title="Could not load deals" description="Something went wrong. Please try again." /></Card>
      ) : deals.length === 0 ? (
        <Card><EmptyState title="No deals yet" description="Convert a lead to see it appear here automatically." /></Card>
      ) : (
        <Card>
          <TableShell label="Deals">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th scope="col" className="px-4 py-3">Client</th>
                  <th scope="col" className="px-4 py-3">City</th>
                  <th scope="col" className="px-4 py-3">Phone</th>
                  <th scope="col" className="px-4 py-3">Converted</th>
                  <th scope="col" className="px-4 py-3">Tracking</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <td className="max-w-[220px] px-4 py-3">
                      <span className="flex items-center gap-2.5">
                        <Avatar url="" name={d.title} size={34} />
                        <Link to={`/deals/${d.id}`} className="truncate font-semibold text-slate-900 hover:text-brand-700 hover:underline dark:text-slate-100">{d.title}</Link>
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{d.city || '—'}</td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-slate-500">{d.phone || d.phoneUnformatted || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(d.convertedAt)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="flex gap-1.5">
                        <Badge tone="neutral">{d.entryCounts.requirements} requirements</Badge>
                        <Badge tone="neutral">{d.entryCounts.progress} updates</Badge>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/deals/${d.id}`} aria-label={`View ${d.title}`} className="inline-flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700">
                        <Eye size={17} aria-hidden />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="min-h-0 px-3 py-1.5 text-xs">Prev</Button>
            <span className="text-slate-500" role="status">Page {list.data?.page} · {list.data?.total} total</span>
            <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={deals.length < PAGE_SIZE} className="min-h-0 px-3 py-1.5 text-xs">Next</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
