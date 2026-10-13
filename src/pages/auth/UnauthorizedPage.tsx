import { Link } from 'react-router-dom';
export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-bold">403 — Not authorized</h1>
      <p className="max-w-sm text-sm text-slate-500">You are signed in but do not have permission to view this page. Managers cannot access admin areas.</p>
      <Link to="/dashboard" className="font-semibold text-brand-600 hover:underline">Back to dashboard</Link>
    </div>
  );
}
