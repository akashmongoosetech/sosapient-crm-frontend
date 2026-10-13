import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { FieldError } from '../../../components/ui/primitives';

const ACCEPT = '.jpg,.jpeg,.png,.webp,.svg';
const MAX_FILES = 6;

export interface PickedFile {
  file: File;
  preview: string;
}

export function ImageUploadField({ files, onChange, error, disabled }: {
  files: PickedFile[];
  onChange: (files: PickedFile[]) => void;
  error?: string;
  disabled?: boolean;
}) {
  const [localError, setLocalError] = useState('');

  // Revoke object URLs on unmount only (parents own the list lifetime).
  useEffect(() => () => {
    for (const f of files) URL.revokeObjectURL(f.preview);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function add(list: FileList | null) {
    setLocalError('');
    if (!list) return;
    const picked: PickedFile[] = [];
    for (const file of Array.from(list)) {
      if (!/\.(jpe?g|png|webp|svg)$/i.test(file.name)) {
        setLocalError(`"${file.name}" is not a supported image (JPG, PNG, WEBP, SVG).`);
        continue;
      }
      picked.push({ file, preview: URL.createObjectURL(file) });
    }
    const merged = [...files, ...picked].slice(0, MAX_FILES);
    if (files.length + picked.length > MAX_FILES) setLocalError(`Maximum ${MAX_FILES} images per entry.`);
    if (picked.length > 0 || merged.length !== files.length) onChange(merged);
  }

  function remove(index: number) {
    const next = files.filter((_, i) => i !== index);
    URL.revokeObjectURL(files[index].preview);
    onChange(next);
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center transition hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:bg-brand-950/30">
        <ImagePlus size={24} aria-hidden className="text-brand-600 dark:text-brand-300" />
        <span className="mt-1.5 text-sm font-semibold">Add images ({files.length}/{MAX_FILES})</span>
        <span className="mt-0.5 text-xs text-slate-500">JPG, PNG, WEBP, SVG · up to 5MB each</span>
        <input
          type="file" accept={ACCEPT} multiple disabled={disabled}
          className="sr-only" aria-label="Attach images"
          onChange={(e) => { add(e.target.files); e.target.value = ''; }}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Selected images">
          {files.map((f, i) => (
            <li key={`${f.file.name}-${i}`} className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <img src={f.preview} alt={f.file.name} className="h-20 w-full object-cover" />
              <button
                type="button" onClick={() => remove(i)} disabled={disabled}
                aria-label={`Remove ${f.file.name}`}
                className="absolute right-1 top-1 rounded-md bg-slate-950/70 p-1 text-white transition hover:bg-slate-950"
              >
                <X size={14} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {(localError || error) && <div className="mt-2"><FieldError message={localError || error} /></div>}
    </div>
  );
}
