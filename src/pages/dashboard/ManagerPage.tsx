import { useAuth } from '../../context/AuthContext';
import { Badge, Card, PageHeader } from '../../components/ui/primitives';
import { Avatar } from '../../components/common/Avatar';

function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export default function ManagerPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-5">
      <PageHeader title="My workspace" breadcrumb="Home / My Workspace" />
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <Avatar url={user?.profilePicUrl} name={`${user?.firstName} ${user?.lastName}`} size={56} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{user?.firstName} {user?.lastName}</p>
          <p className="truncate text-sm text-slate-500">{user?.email} · {user?.username} · {user?.mobileNumber}</p>
          <div className="mt-1.5">
            <Badge tone={user?.role === 'admin' ? 'brand' : 'neutral'}>{user ? capitalizeRole(user.role) : ''}</Badge>
          </div>
        </div>
      </Card>
      <Card className="p-5 text-sm text-slate-500 dark:text-slate-400">Profile editing and assigned CRM records arrive in the next milestone. No fabricated activity is shown.</Card>
    </div>
  );
}
