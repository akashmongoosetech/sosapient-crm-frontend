import { useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { CRMSidebar } from './CRMSidebar';
import { MobileSidebar } from './MobileSidebar';
import { CRMHeader } from './CRMHeader';

export function CRMLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex min-h-screen overflow-x-clip bg-slate-50 dark:bg-slate-950">
      <a
        href="#crm-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <CRMSidebar />
      <MobileSidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        triggerRef={menuButtonRef}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <CRMHeader onOpenMobileNav={() => setMobileOpen(true)} menuButtonRef={menuButtonRef} />
        <main id="crm-main" className="flex-1 p-4 md:p-6" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
