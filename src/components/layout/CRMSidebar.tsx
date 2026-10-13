import { useSelector } from 'react-redux';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../context/AuthContext';
import type { RootState } from '../../store/store';
import { toggleSidebar } from '../../store/store';
import { visibleNavItems, type NavItem } from '../../types/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { BrandLogo, BrandMark } from '../common/BrandLogo';
import { cn } from '../../utils';

const SECTIONS: NavItem['section'][] = ['Workspace', 'Administration'];

export function CRMSidebar() {
  const { user } = useAuth();
  const collapsed = useSelector((s: RootState) => !s.ui.sidebarOpen);
  const dispatch = useDispatch();
  const items = user ? visibleNavItems(user.role) : [];

  return (
    <aside
      aria-label="CRM navigation"
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex dark:border-slate-800 dark:bg-slate-900',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className={cn('flex h-16 items-center gap-2.5 border-b border-slate-100 px-4 dark:border-slate-800', collapsed && 'justify-center px-2')}>
        {collapsed ? (
          <span role="img" aria-label="Sosapient CRM">
            <BrandMark size={36} />
          </span>
        ) : (
          <>
            <BrandLogo height={34} />
            <span className="truncate">
              <span className="block text-sm font-bold leading-tight tracking-tight">Sosapient CRM</span>
              <span className="block text-[11px] font-medium text-slate-500">CRM Workspace</span>
            </span>
          </>
        )}
      </div>
      <nav className="crm-scroll flex-1 space-y-4 overflow-y-auto p-3" aria-label="Primary">
        {SECTIONS.map((section) => {
          const sectionItems = items.filter((i) => i.section === section);
          if (sectionItems.length === 0) return null;
          return (
            <div key={section} className="space-y-1">
              {!collapsed && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {section}
                </p>
              )}
              {sectionItems.map((item) => (
                <SidebarNavItem key={item.to} item={item} collapsed={collapsed} />
              ))}
            </div>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => dispatch(toggleSidebar())}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-slate-400 dark:hover:bg-brand-950 dark:hover:text-brand-200',
            collapsed && 'justify-center px-2'
          )}
        >
          {collapsed ? <ChevronsRight size={18} aria-hidden /> : <ChevronsLeft size={18} aria-hidden />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
