import type { LucideIcon } from 'lucide-react';
import { Building2, ContactRound, Handshake, Target } from 'lucide-react';
import { Card } from '../../components/ui/primitives';

export const MODULE_META: Record<string, { title: string; description: string; icon: LucideIcon }> = {
  leads: { title: 'Leads', description: 'Capture, qualify, and track prospective customers.', icon: Target },
  deals: { title: 'Deals', description: 'Manage opportunities through every stage of your pipeline.', icon: Handshake },
  accounts: { title: 'Accounts', description: 'Keep a record of the companies you do business with.', icon: Building2 },
  contacts: { title: 'Contacts', description: 'Store the people behind every account and deal.', icon: ContactRound },
};

export default function ModulePlaceholderPage({ module }: { module: keyof typeof MODULE_META }) {
  const meta = MODULE_META[module];
  const Icon = meta.icon;
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 text-center sm:p-12">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
          <Icon size={26} aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-bold">{meta.title}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>
        <p className="mx-auto mt-4 max-w-md rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-inset ring-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:ring-slate-700">
          This module will be implemented in a future development phase.
        </p>
      </Card>
    </div>
  );
}
