import { motion } from 'framer-motion';
import { CalendarClock, Handshake, History, Target } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/primitives';

const SECTIONS = [
  { title: 'Leads Overview', description: 'Charts and summaries for your pipeline leads will appear here.', icon: Target },
  { title: 'Deals Overview', description: 'Deal stages, values, and forecasts will appear here.', icon: Handshake },
  { title: 'Recent Activity', description: 'A timeline of recent record changes will appear here.', icon: History },
  { title: 'Tasks & Reminders', description: 'Upcoming tasks and reminders will appear here.', icon: CalendarClock },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome{user?.firstName ? `, ${user.firstName}` : ''}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          This is your CRM workspace. Modules below are placeholders — business functionality arrives in a later phase.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
          >
            <Card className="h-full p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                <s.icon size={20} aria-hidden />
              </span>
              <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.description}</p>
              <p className="mt-3 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Placeholder
              </p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
