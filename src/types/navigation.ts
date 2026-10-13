import {
  Building2,
  ContactRound,
  Handshake,
  LayoutDashboard,
  Target,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { User } from './index';

export type Role = User['role'];

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
  /** Sidebar group heading. */
  section: 'Workspace' | 'Administration';
  /** Exact matching for this route (default false so nested routes stay highlighted). */
  end?: boolean;
}

/** Sidebar navigation in the required order. Users is admin-only. */
export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager'], section: 'Workspace', end: true },
  { to: '/leads', label: 'Leads', icon: Target, roles: ['admin', 'manager'], section: 'Workspace' },
  { to: '/deals', label: 'Deals', icon: Handshake, roles: ['admin', 'manager'], section: 'Workspace' },
  { to: '/accounts', label: 'Accounts', icon: Building2, roles: ['admin', 'manager'], section: 'Workspace' },
  { to: '/contacts', label: 'Contacts', icon: ContactRound, roles: ['admin', 'manager'], section: 'Workspace' },
  { to: '/users', label: 'Users', icon: Users, roles: ['admin'], section: 'Administration' },
];

/** Header title / breadcrumb label per route. */
export const TITLE_BY_PATH: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/leads/new': 'Add Lead',
  '/deals': 'Deals',
  '/accounts': 'Accounts',
  '/contacts': 'Contacts',
  '/users': 'Users',
  '/profile': 'My Profile',
  '/manager': 'My Workspace',
  '/admin': 'Admin Overview',
  '/admin/users': 'User Management',
};

export function visibleNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
