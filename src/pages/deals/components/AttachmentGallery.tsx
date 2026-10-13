import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Expand, X } from 'lucide-react';
import { apiFileUrl } from '../../../services/apiClient';
import type { Attachment } from '../../../types/deal';

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentGallery({ attachments }: { attachments: Attachment[] }) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  const close = useCallback(() => setLightbox(null), []);
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? null : (i + 1) % attachments.length));
      if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? null : (i - 1 + attachments.length) % attachments.length));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [lightbox, attachments.length, close]);

  if (attachments.length === 0) return null;
  const current = lightbox !== null ? attachments[lightbox] : null;

  return (
    <>
      <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4" aria-label="Attachments">
        {attachments.map((a, i) => (
          <li key={`${a.url}-${i}`}>
            <button
              type="button" onClick={() => setLightbox(i)}
              aria-label={`Open ${a.filename}`}
              className="group relative block w-full overflow-hidden rounded-lg border border-slate-200 transition hover:border-brand-300 dark:border-slate-700"
            >
              <img src={apiFileUrl(a.url)} alt={a.filename} loading="lazy" className="h-28 w-full object-cover sm:h-32" />
              <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-slate-950/80 to-transparent px-2 pb-1.5 pt-5 text-left text-[11px] font-medium text-white">
                <Expand size={12} aria-hidden className="shrink-0 opacity-0 transition group-hover:opacity-100" />
                <span className="truncate">{a.filename}</span>
              </span>
            </button>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">{fmtSize(a.size)}</p>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {current && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={current.filename}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/85" onClick={close} aria-hidden />
            <motion.figure initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="relative max-h-full max-w-4xl">
              <img src={apiFileUrl(current.url)} alt={current.filename} className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain" />
              <figcaption className="mt-2 text-center text-sm text-slate-300">{current.filename} · {fmtSize(current.size)}</figcaption>
              <button type="button" onClick={close} aria-label="Close preview" className="absolute -right-2 -top-2 rounded-full bg-white p-2 text-slate-700 shadow-lg transition hover:bg-slate-100">
                <X size={18} aria-hidden />
              </button>
            </motion.figure>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
