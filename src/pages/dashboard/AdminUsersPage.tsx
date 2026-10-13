import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import { apiFetch } from '../../services/apiClient';
import type { ApiEnvelope, User } from '../../types';
import { Badge, Button, Card, EmptyState, Input, PageHeader, Skeleton, TableShell } from '../../components/ui/primitives';
import { Avatar } from '../../components/common/Avatar';

interface ListData { users: User[]; page: number; limit: number; total: number }

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['admin-users', page, q],
    queryFn: () => apiFetch<ApiEnvelope<ListData>>(`/admin/users?page=${page}&limit=10${q ? `&q=${encodeURIComponent(q)}` : ''}`),
  });

  async function setStatus(id: string, isActive: boolean) {
    try { await apiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isActive }) }); toast.success(isActive ? 'Activated' : 'Deactivated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); }
    catch (e) { toast.error((e as Error).message); }
  }
  async function setRole(id: string, role: string) {
    try { await apiFetch(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }); toast.success(`Role → ${role}`); qc.invalidateQueries({ queryKey: ['admin-users'] }); }
    catch (e) { toast.error((e as Error).message); }
  }

  const users = list.data?.data.users ?? [];
  const total = list.data?.data.total ?? 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="User management"
        breadcrumb="Home / Admin / Users"
        description="Activate, deactivate, and manage roles for workspace accounts."
      />
      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Filter by email or username"
            aria-label="Filter users"
            className="pl-9"
          />
        </div>
      </Card>

      {list.isLoading ? (
        <Card className="space-y-3 p-5" aria-label="Loading users">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </Card>
      ) : list.isError ? (
        <Card><EmptyState title="Could not load users" description="Something went wrong while fetching the user list. Please try again." /></Card>
      ) : users.length === 0 ? (
        <Card><EmptyState title="No users found" description="Try adjusting your filter, or invite new members once onboarding is available." /></Card>
      ) : (
        <Card>
          <TableShell label="Workspace users">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th scope="col" className="px-4 py-3">User</th>
                  <th scope="col" className="px-4 py-3">Role</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <span className="flex min-w-0 items-center gap-3">
                        <Avatar url={u.profilePicUrl} name={`${u.firstName} ${u.lastName}`} size={36} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-slate-900 dark:text-slate-100">{u.firstName} {u.lastName}</span>
                          <span className="block truncate text-xs text-slate-500">{u.email} · {u.username}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.role === 'admin' ? 'brand' : 'neutral'}>{u.role === 'admin' ? 'Admin' : 'Manager'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={u.isActive ? 'success' : 'warning'}>{u.isActive ? 'Active' : 'Disabled'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex flex-wrap gap-2">
                        <Button
                          variant={u.isActive ? 'outline' : 'primary'}
                          onClick={() => setStatus(u.id, !u.isActive)}
                          className="min-h-0 px-3 py-1.5 text-xs"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="ghost" onClick={() => setRole(u.id, u.role === 'admin' ? 'manager' : 'admin')} className="min-h-0 px-3 py-1.5 text-xs">
                          {u.role === 'admin' ? 'Demote' : 'Promote'}
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableShell>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
            <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="min-h-0 px-3 py-1.5 text-xs">Prev</Button>
            <span className="text-slate-500">Page {list.data?.data.page} · {total} total</span>
            <Button variant="outline" onClick={() => setPage((p) => p + 1)} disabled={users.length < 10} className="min-h-0 px-3 py-1.5 text-xs">Next</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
