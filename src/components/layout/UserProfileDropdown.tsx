import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { cn } from '../../utils';

function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function UserProfileDropdown() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Account';

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open ]);

  // Focus the active menu item when opened via keyboard.
  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      itemRefs.current[0]?.focus();
    }
  }, [open ]);

  function close() {
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (activeIndex + 1) % itemRefs.current.length;
      setActiveIndex(next);
      itemRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (activeIndex - 1 + itemRefs.current.length) % itemRefs.current.length;
      setActiveIndex(prev);
      itemRefs.current[prev]?.focus();
    } else if (e.key === 'Tab') {
      close();
    }
  }

  async function onLogout() {
    close();
    await logout();
    toast.success('Signed out');
    nav('/login');
  }

  function goProfile() {
    close();
    nav('/profile');
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Profile menu for ${fullName}`}
        className="flex max-w-[220px] items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-600 dark:hover:bg-slate-800"
      >
        <Avatar url={user?.profilePicUrl} name={fullName} size={36} />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-sm font-semibold leading-tight">{fullName}</span>
          <span className="block text-xs capitalize leading-tight text-slate-500">
            {user ? capitalizeRole(user.role) : ''}
          </span>
        </span>
        <ChevronDown
          size={16}
          aria-hidden
          className={cn('shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Profile"
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <Avatar url={user?.profilePicUrl} name={fullName} size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{fullName}</p>
                <p className="text-xs capitalize text-slate-500">{user ? capitalizeRole(user.role) : ''}</p>
                {user?.email && <p className="truncate text-xs text-slate-500">{user.email}</p>}
              </div>
            </div>
            <div className="p-1.5" role="none">
              <button
                ref={(el) => { itemRefs.current[0] = el; }}
                type="button"
                role="menuitem"
                onClick={goProfile}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:bg-brand-50 focus-visible:text-brand-700 focus-visible:outline-none dark:text-slate-200 dark:hover:bg-brand-950 dark:hover:text-brand-200 dark:focus-visible:bg-brand-950"
              >
                <UserIcon size={16} aria-hidden /> My Profile
              </button>
              <button
                ref={(el) => { itemRefs.current[1] = el; }}
                type="button"
                role="menuitem"
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none dark:text-red-400 dark:hover:bg-red-950/40 dark:focus-visible:bg-red-950/40"
              >
                <LogOut size={16} aria-hidden /> Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
