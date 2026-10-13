import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '../../../components/ui/primitives';

export function DeleteLeadModal({ open, leadName, deleting, error, onCancel, onConfirm, title = 'Delete lead?', actionLabel = 'Delete', busyLabel = 'Deleting…' }: {
  open: boolean;
  leadName: string;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  actionLabel?: string;
  busyLabel?: string;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !deleting) onCancel(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, deleting, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/50" onClick={() => { if (!deleting) onCancel(); }} aria-hidden />
          <motion.div
            role="alertdialog" aria-modal="true" aria-labelledby="delete-lead-title" aria-describedby="delete-lead-desc"
            initial={{ opacity: 0, scale: 0.96, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <button type="button" onClick={onCancel} disabled={deleting} aria-label="Close dialog" className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50">
              <X size={18} aria-hidden />
            </button>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300" aria-hidden>
              <AlertTriangle size={22} />
            </span>
            <h2 id="delete-lead-title" className="mt-3 text-lg font-bold">{title}</h2>
            <p id="delete-lead-desc" className="mt-1 text-sm text-slate-500">
              <span className="font-semibold text-slate-900 dark:text-slate-100">“{leadName}”</span> will be permanently deleted. This action cannot be undone.
            </p>
            {error && <p role="alert" className="mt-2 text-sm font-medium text-brand-700">{error}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button ref={cancelRef} variant="outline" onClick={onCancel} disabled={deleting}>Cancel</Button>
              <Button variant="destructive" onClick={onConfirm} disabled={deleting}>{deleting ? busyLabel : actionLabel}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
