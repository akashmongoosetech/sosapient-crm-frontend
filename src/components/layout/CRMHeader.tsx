import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Menu } from 'lucide-react';
import type { RootState } from '../../store/store';
import { toggleSidebar } from '../../store/store';
import { TITLE_BY_PATH } from '../../types/navigation';
import { UserProfileDropdown } from './UserProfileDropdown';
import type { RefObject } from 'react';

interface Props {
  onOpenMobileNav: () => void;
  menuButtonRef: RefObject<HTMLButtonElement>;
}

function titleFor(pathname: string): string {
  if (TITLE_BY_PATH[pathname]) return TITLE_BY_PATH[pathname];
  // Nested routes (e.g. /admin/users/123) inherit the closest parent title.
  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 1) {
    segments.pop();
    const parent = `/${segments.join('/')}`;
    if (TITLE_BY_PATH[parent]) return TITLE_BY_PATH[parent];
  }
  return 'CRM Workspace';
}

export function CRMHeader({ onOpenMobileNav, menuButtonRef }: Props) {
  const loc = useLocation();
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((s: RootState) => s.ui.sidebarOpen);
  const title = titleFor(loc.pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:px-4 dark:border-slate-800 dark:bg-slate-900">
      {/* Mobile: open drawer. Desktop: collapse/expand sidebar. */}
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onOpenMobileNav}
        aria-label="Open navigation menu"
        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-brand-600 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu size={20} aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => dispatch(toggleSidebar())}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        aria-expanded={sidebarOpen}
        className="hidden rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-brand-600 md:block dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Menu size={20} aria-hidden />
      </button>

      <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">
          CRM Workspace <span aria-hidden> / </span> <span className="text-slate-500 dark:text-slate-400">{title}</span>
        </p>
        <h1 className="truncate text-base font-bold leading-tight sm:text-lg">{title}</h1>
      </nav>

      <UserProfileDropdown />
    </header>
  );
}
