import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/primitives';

/** Admin-only entry page: the real management UI lives at /admin/users (preserved). */
export default function UsersPlaceholderPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card className="p-8 text-center sm:p-12">
        <h2 className="text-xl font-bold">Users</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          A full user directory experience will be implemented in a future development phase.
        </p>
        <Link
          to="/admin/users"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-brand-600"
        >
          Open user management <ArrowRight size={16} aria-hidden />
        </Link>
      </Card>
    </div>
  );
}
