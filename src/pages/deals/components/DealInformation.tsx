import { Link } from 'react-router-dom';
import { ExternalLink, Phone } from 'lucide-react';
import { Badge, Card } from '../../../components/ui/primitives';
import type { Deal } from '../../../types/deal';

function ensureUrl(website: string): string {
  return website.includes('://') ? website : `https://${website}`;
}

export function DealInformation({ deal }: { deal: Deal }) {
  const rows: { label: string; value: React.ReactNode; show: boolean }[] = [
    { label: 'Category', value: deal.categoryName, show: !!deal.categoryName },
    { label: 'Address', value: deal.address, show: !!deal.address },
    { label: 'City', value: deal.city, show: !!deal.city },
    { label: 'State', value: deal.state, show: !!deal.state },
  ];
  const phone = deal.phone || deal.phoneUnformatted;
  const phoneHref = (deal.phoneUnformatted || deal.phone).replace(/[^\d+]/g, '');

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="brand">Converted</Badge>
        <span className="text-xs text-slate-500">
          Converted {new Date(deal.convertedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        {rows.map((r) => r.show && (
          <div key={r.label} className="grid grid-cols-[130px_1fr] gap-2">
            <dt className="font-medium text-slate-500">{r.label}</dt>
            <dd className="text-slate-900 dark:text-slate-100">{r.value}</dd>
          </div>
        ))}
        {phone && (
          <div className="grid grid-cols-[130px_1fr] gap-2">
            <dt className="font-medium text-slate-500">Phone</dt>
            <dd>
              <a href={`tel:${phoneHref}`} className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline dark:text-brand-300">
                <Phone size={14} aria-hidden /> {phone}
              </a>
            </dd>
          </div>
        )}
        {deal.website && (
          <div className="grid grid-cols-[130px_1fr] gap-2">
            <dt className="font-medium text-slate-500">Website</dt>
            <dd>
              <a href={ensureUrl(deal.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-brand-700 hover:underline dark:text-brand-300">
                <ExternalLink size={14} aria-hidden /> {deal.website}
              </a>
            </dd>
          </div>
        )}
      </dl>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800">
        Deal status is system-controlled and cannot be changed. · <Link to="/leads" className="font-semibold text-brand-600 hover:underline">Back to leads</Link>
      </p>
    </Card>
  );
}
