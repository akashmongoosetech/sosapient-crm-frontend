import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileJson, Upload, X } from 'lucide-react';
import { Button, Card, FieldError } from '../../../components/ui/primitives';
import { useImportConfirm, useImportPreview } from '../../../services/leadService';
import type { ImportPreview } from '../../../types/lead';

type Step = 'pick' | 'preview' | 'done';

export function LeadImportModal({ open, onClose, onImported }: { open: boolean; onClose: () => void; onImported: () => void }) {
  const [step, setStep] = useState<Step>('pick');
  const [fileName, setFileName] = useState('');
  const [records, setRecords] = useState<unknown[]>([]);
  const [parseError, setParseError] = useState('');
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [result, setResult] = useState<{ imported: number; skippedDuplicates: number; invalid: number; total: number } | null>(null);
  const previewMut = useImportPreview();
  const confirmMut = useImportConfirm();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setStep('pick'); setFileName(''); setRecords([]); setParseError('');
      setPreview(null); setConfirmError(''); setResult(null); setConfirming(false);
      setTimeout(() => closeRef.current?.focus(), 50);
    }
  }, [open ]);

  useEffect(() => {
    if (!open || previewMut.isPending || confirming) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, previewMut.isPending, confirming, onClose ]);

  async function onFile(file: File | undefined) {
    setParseError(''); setPreview(null); setResult(null);
    if (!file) return;
    if (!/\.json$/i.test(file.name)) { setParseError('Please select a .json file.'); return; }
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) { setParseError('The file contains no records.'); return; }
      if (arr.length > 5000) { setParseError('Maximum 5000 records per import.'); return; }
      setFileName(file.name);
      setRecords(arr);
      previewMut.mutate(arr, {
        onSuccess: (data) => { setPreview(data); setStep('preview'); },
        onError: (e: Error) => setParseError(e.message),
      });
    } catch {
      setParseError('Invalid JSON — the file could not be parsed.');
    }
  }

  function onConfirm() {
    setConfirmError(''); setConfirming(true);
    confirmMut.mutate(records, {
      onSuccess: (data) => {
        setConfirming(false);
        setResult({ imported: data.imported, skippedDuplicates: data.skippedDuplicates, invalid: data.invalid, total: data.total });
        setStep('done');
        onImported();
      },
      onError: (e: Error) => { setConfirming(false); setConfirmError(e.message); },
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/50" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog" aria-modal="true" aria-labelledby="lead-import-title"
            initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.16 }}
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900"
          >
            <button ref={closeRef} type="button" onClick={onClose} aria-label="Close import dialog" className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
              <X size={18} aria-hidden />
            </button>
            <h2 id="lead-import-title" className="flex items-center gap-2 text-lg font-bold">
              <FileJson size={20} aria-hidden className="text-brand-600" /> Import leads from JSON
            </h2>

            {step === 'pick' && (
              <div className="mt-4">
                <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-10 text-center transition hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700">
                  <Upload size={28} aria-hidden className="text-brand-600" />
                  <span className="mt-2 text-sm font-semibold">{fileName || 'Choose a .json file'}</span>
                  <span className="mt-1 text-xs text-slate-500">Array of lead objects, or a single object · max 5000 records</span>
                  <input type="file" accept=".json,application/json" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
                </label>
                {previewMut.isPending && <p className="mt-3 text-sm text-slate-500" role="status">Analyzing records…</p>}
                {parseError && <div className="mt-3"><FieldError message={parseError} /></div>}
              </div>
            )}

            {step === 'preview' && preview && (
              <div className="mt-4 space-y-4">
                <Card className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-5">
                  {[
                    ['Total in file', preview.total],
                    ['New records', preview.new],
                    ['DB duplicates', preview.dbDuplicates],
                    ['In-file duplicates', preview.fileDuplicates],
                    ['Invalid', preview.invalid],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                      <p className="text-2xl font-bold">{value as number}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label as string}</p>
                    </div>
                  ))}
                </Card>
                <p className="text-sm text-slate-500">
                  {preview.new} record{preview.new === 1 ? '' : 's'} will be imported. {preview.dbDuplicates + preview.fileDuplicates} duplicate{preview.dbDuplicates + preview.fileDuplicates === 1 ? '' : 's'} and {preview.invalid} invalid record{preview.invalid === 1 ? '' : 's'} will be skipped.
                  {preview.truncated && ' Detail lists below are truncated to 50 entries.'}
                </p>
                {preview.duplicateDetails.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold">Duplicates (skipped)</h3>
                    <ul className="mt-1 max-h-36 space-y-1 overflow-y-auto text-sm text-slate-500">
                      {preview.duplicateDetails.map((d, i) => (
                        <li key={i}>#{d.index + 1} {d.title} — matched by {d.rule} ({d.scope})</li>
                      ))}
                    </ul>
                  </div>
                )}
                {preview.invalidDetails.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold">Invalid (skipped)</h3>
                    <ul className="mt-1 space-y-1 text-sm text-slate-500">
                      {preview.invalidDetails.map((d, i) => (
                        <li key={i}>#{d.index + 1} — {d.reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {confirmError && <FieldError message={confirmError} />}
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setStep('pick')} disabled={confirming}>Back</Button>
                  <Button onClick={onConfirm} disabled={confirming || preview.new === 0}>
                    {confirming ? 'Importing…' : `Import ${preview.new} record${preview.new === 1 ? '' : 's'}`}
                  </Button>
                </div>
              </div>
            )}

            {step === 'done' && result && (
              <div className="mt-4 space-y-3">
                <Card className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                  {[
                    ['Submitted', result.total],
                    ['Imported', result.imported],
                    ['Skipped duplicates', result.skippedDuplicates],
                    ['Invalid', result.invalid],
                  ].map(([label, value]) => (
                    <div key={label as string} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                      <p className="text-2xl font-bold">{value as number}</p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label as string}</p>
                    </div>
                  ))}
                </Card>
                <div className="flex justify-end">
                  <Button onClick={onClose}>Done</Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
