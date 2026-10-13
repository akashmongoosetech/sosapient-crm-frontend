import { Search, X } from 'lucide-react';
import { Button, Card, Input, Label } from '../../../components/ui/primitives';
import { LEAD_STATUSES, type LeadListParams } from '../../../types/lead';

export interface FilterState {
  q: string;
  category: string;
  city: string;
  contact: NonNullable<LeadListParams['contact']>;
  status: string;
}

export const EMPTY_FILTERS: FilterState = { q: '', category: '', city: '', contact: 'all', status: '' };

const CONTACT_OPTIONS: { value: FilterState['contact']; label: string }[] = [
  { value: 'all', label: 'All Leads' },
  { value: 'phone', label: 'Phone Available' },
  { value: 'website', label: 'Website Available' },
  { value: 'both', label: 'Both Available' },
  { value: 'mobileOnly', label: 'Mobile Only (No Website)' },
  { value: 'websiteOnly', label: 'Website Only (No Mobile)' },
  { value: 'neither', label: 'Neither Available' },
];

function Select({ id, label, value, onChange, children }: {
  id: string; label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950"
      >
        {children}
      </select>
    </div>
  );
}

export function LeadFilters({ filters, onChange, categories, cities, total }: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  categories: string[];
  cities: string[];
  total: number | undefined;
}) {
  const set = (k: keyof FilterState, v: string) => onChange({ ...filters, [k]: v });
  const active = [filters.q, filters.category, filters.city, filters.status].some(Boolean) || filters.contact !== 'all';

  return (
    <Card className="space-y-4 p-4">
      <div className="relative">
        <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.q} onChange={(e) => set('q', e.target.value)}
          placeholder="Search name, category, city, phone, website…" aria-label="Search leads" className="pl-9"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select id="f-category" label="Category" value={filters.category} onChange={(v) => set('category', v)}>
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select id="f-city" label="City" value={filters.city} onChange={(v) => set('city', v)}>
          <option value="">All Cities</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select id="f-contact" label="Contact Info" value={filters.contact} onChange={(v) => set('contact', v as FilterState['contact'])}>
          {CONTACT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select id="f-status" label="Status" value={filters.status} onChange={(v) => set('status', v)}>
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {active && (
          <Button variant="ghost" onClick={() => onChange(EMPTY_FILTERS)} className="min-h-0 px-3 py-1.5 text-xs">
            <X size={14} aria-hidden /> Clear Filters
          </Button>
        )}
        <span className="ml-auto text-sm text-slate-500" role="status">
          {total === undefined ? 'Loading…' : `${total} matching record${total === 1 ? '' : 's'}`}
        </span>
      </div>
    </Card>
  );
}
