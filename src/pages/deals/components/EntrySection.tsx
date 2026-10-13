import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useDeleteEntry, useEntries, useSaveEntry, useUpdateEntry } from '../../../services/dealService';
import { Badge, Button, Card, EmptyState, FieldError, Input, Label, Skeleton } from '../../../components/ui/primitives';
import { DeleteLeadModal } from '../../leads/components/DeleteLeadModal';
import { ImageUploadField, type PickedFile } from './ImageUploadField';
import { AttachmentGallery } from './AttachmentGallery';
import { Avatar } from '../../../components/common/Avatar';
import type { DealEntry, EntryKind } from '../../../types/deal';

function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

/** Per-entry creator attribution — always the entry's own author, never the viewer. */
function EntryCreatorHeader({ entry }: { entry: DealEntry }) {
  const creator = entry.creator;
  const name = creator && (creator.firstName || creator.lastName)
    ? `${creator.firstName} ${creator.lastName}`.trim()
    : 'Unknown User';
  const addedOn = (() => {
    try {
      return new Date(entry.createdAt).toLocaleString(undefined, {
        day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
      });
    } catch { return ''; }
  })();
  return (
    <div className="flex min-w-0 items-center gap-2.5 border-b border-slate-100 pb-2.5 dark:border-slate-800">
      <Avatar url={creator?.profilePicUrl} name={name} size={34} />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</span>
          {creator && (
            <Badge tone={creator.role === 'admin' ? 'brand' : 'neutral'}>
              {capitalizeRole(creator.role)}
            </Badge>
          )}
        </p>
        {addedOn && <p className="mt-0.5 text-xs text-slate-500">Added on: {addedOn}</p>}
      </div>
    </div>
  );
}

const formSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(5000, 'Description is too long'),
  entryDate: z.string().trim().min(1, 'Date is required').refine((v) => !Number.isNaN(new Date(v).getTime()), 'Enter a valid date'),
});
type FormInput = z.infer<typeof formSchema>;

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

const KIND_COPY: Record<EntryKind, { title: string; singular: string; addLabel: string; empty: string; placeholder: string }> = {
  requirement: {
    title: 'Client Requirements',
    singular: 'requirement',
    addLabel: 'Add Requirement',
    empty: 'No client requirements recorded yet.',
    placeholder: 'e.g. Client wants an appointment booking page with online payment integration…',
  },
  progress: {
    title: 'Project Progress',
    singular: 'progress update',
    addLabel: 'Add Progress',
    empty: 'No progress updates recorded yet.',
    placeholder: 'e.g. Created the initial dashboard layout and configured the backend API…',
  },
};

function EntryForm({ dealId, kind, editing, onDone }: {
  dealId: string;
  kind: EntryKind;
  editing: DealEntry | null;
  onDone: () => void;
}) {
  const copy = KIND_COPY[kind];
  const save = useSaveEntry(dealId, kind);
  const update = useUpdateEntry(dealId, kind);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [kept, setKept] = useState<string[]>((editing?.attachments || []).map((a) => a.url.split('/').pop() || ''));
  const busy = save.isPending || update.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: editing?.description || '',
      entryDate: editing ? editing.entryDate.slice(0, 10) : todayISO(),
    },
  });

  function submit(v: FormInput) {
    if (editing) {
      update.mutate(
        { entryId: editing.id, description: v.description, entryDate: v.entryDate, keepAttachments: kept },
        { onSuccess: () => { reset(); onDone(); } }
      );
    } else {
      save.mutate(
        { description: v.description, entryDate: v.entryDate, files: files.map((f) => f.file) },
        {
          onSuccess: () => {
            for (const f of files) URL.revokeObjectURL(f.preview);
            setFiles([]);
            reset({ description: '', entryDate: todayISO() });
            onDone();
          },
        }
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-900 dark:bg-brand-950/30" noValidate>
      <div>
        <Label htmlFor={`${kind}-${editing ? `edit-${editing.id}` : 'new'}-desc`}>Description</Label>
        <textarea
          id={`${kind}-${editing ? `edit-${editing.id}` : 'new'}-desc`}
          rows={3}
          disabled={busy}
          placeholder={copy.placeholder}
          {...register('description')}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950"
        />
        {errors.description && <FieldError message={errors.description.message} />}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${kind}-${editing ? `edit-${editing.id}` : 'new'}-date`}>Date</Label>
          <Input id={`${kind}-${editing ? `edit-${editing.id}` : 'new'}-date`} type="date" disabled={busy} {...register('entryDate')} />
          {errors.entryDate && <FieldError message={errors.entryDate.message} />}
        </div>
        {!editing && <ImageUploadField files={files} onChange={setFiles} disabled={busy} />}
      </div>
      {editing && editing.attachments.length > 0 && (
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">Keep attachments</legend>
          <div className="flex flex-wrap gap-2">
            {editing.attachments.map((a) => {
              const key = a.url.split('/').pop() || a.filename;
              const on = kept.includes(key);
              return (
                <label key={key} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition ${on ? 'bg-brand-50 text-brand-700 ring-brand-200 dark:bg-brand-950 dark:text-brand-200' : 'bg-slate-100 text-slate-400 ring-slate-200 line-through dark:bg-slate-800'}`}>
                  <input
                    type="checkbox" className="sr-only" checked={on} disabled={busy}
                    onChange={() => setKept((k) => (on ? k.filter((x) => x !== key) : [...k, key]))}
                  />
                  {a.filename}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      {editing && <p className="text-xs text-slate-500">New files can't be added while editing — kept attachments are preserved.</p>}
      <div className="flex gap-2">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save Changes' : copy.addLabel}</Button>
        <Button type="button" variant="outline" onClick={onDone} disabled={busy}>Cancel</Button>
      </div>
    </form>
  );
}

export function EntrySection({ dealId, kind }: { dealId: string; kind: EntryKind }) {
  const copy = KIND_COPY[kind];
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DealEntry | null>(null);
  const [deleting, setDeleting] = useState<DealEntry | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const list = useEntries(dealId, kind);
  const del = useDeleteEntry(dealId, kind);

  function onConfirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true); setDeleteError('');
    del.mutate(deleting.id, {
      onSuccess: () => { setDeleteBusy(false); setDeleting(null); },
      onError: (e: Error) => { setDeleteBusy(false); setDeleteError(e.message); },
    });
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight">{copy.title}</h2>
          <p className="text-xs text-slate-500">
            {list.data ? `${list.data.total} ${list.data.total === 1 ? 'entry' : 'entries'} · newest first` : ' '}
          </p>
        </div>
        {!showForm && !editing && (
          <Button onClick={() => setShowForm(true)} className="min-h-0 px-3 py-2 text-xs sm:text-sm">
            <Plus size={16} aria-hidden /> {copy.addLabel}
          </Button>
        )}
      </div>

      {(showForm || editing) && (
        <div className="mt-4">
          <EntryForm
            key={editing ? editing.id : 'new'}
            dealId={dealId} kind={kind} editing={editing}
            onDone={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="mt-4 space-y-3">
        {list.isLoading ? (
          <div className="space-y-2" aria-label={`Loading ${copy.title}`}><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>
        ) : list.isError ? (
          <EmptyState title="Could not load entries" description="Please try again." />
        ) : (list.data?.entries.length ?? 0) === 0 ? (
          <EmptyState title={copy.empty} description={`Use “${copy.addLabel}” to record the first one.`} />
        ) : (
          list.data?.entries.map((e) => (
            <article key={e.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <EntryCreatorHeader entry={e} />
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Badge tone="brand">{fmtDate(e.entryDate)}</Badge>
                <span className="ml-auto flex gap-1">
                  <button
                    type="button" aria-label={`Edit ${copy.singular}`}
                    onClick={() => { setEditing(e); setShowForm(false); }}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Pencil size={16} aria-hidden />
                  </button>
                  <button
                    type="button" aria-label={`Delete ${copy.singular}`}
                    onClick={() => { setDeleting(e); setDeleteError(''); }}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700"
                  >
                    <Trash2 size={16} aria-hidden />
                  </button>
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200">{e.description}</p>
              <AttachmentGallery attachments={e.attachments} />
            </article>
          ))
        )}
      </div>

      <DeleteLeadModal
        open={!!deleting}
        leadName={(deleting?.description || '').slice(0, 80)}
        deleting={deleteBusy} error={deleteError}
        title={`Delete ${copy.singular}?`}
        onCancel={() => { if (!deleteBusy) setDeleting(null); }}
        onConfirm={onConfirmDelete}
      />
    </Card>
  );
}
