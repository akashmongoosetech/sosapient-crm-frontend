import { Link } from 'react-router-dom';
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-3xl font-bold">404 — Page not found</h1>
      <Link to="/" className="font-semibold text-brand-600 hover:underline">Go home</Link>
    </div>
  );
}
