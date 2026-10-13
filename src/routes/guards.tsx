import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing } = useAuth();
  const loc = useLocation();
  if (isInitializing) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Restoring session…</div>;
  if (!isAuthenticated) return <Navigate to={`/login?next=${encodeURIComponent(loc.pathname)}`} replace />;
  return <>{children}</>;
}

export function RoleGuard({ allow, children }: { allow: ('admin' | 'manager')[]; children: ReactNode }) {
  const { user, isInitializing } = useAuth();
  if (isInitializing) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Restoring session…</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Admin inherits manager pages.
  const role = user.role;
  const ok = allow.includes(role) || (role === 'admin' && allow.includes('manager'));
  if (!ok) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

export function PublicOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitializing, user } = useAuth();
  if (isInitializing) return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Restoring session…</div>;
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}
