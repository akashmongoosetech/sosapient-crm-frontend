import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadFormSchema, type LeadFormInput } from '../../../lib/leadValidators';
import { LEAD_STATUSES } from '../../../types/lead';
import { TextField } from '../../../components/forms/fields';
import { Button, FieldError, Label } from '../../../components/ui/primitives';

const ORDER: { name: keyof LeadFormInput; label: string; type?: string; placeholder?: string }[] = [
  { name: 'title', label: 'Lead name *', placeholder: 'Visualeyes Hospital' },
  { name: 'categoryName', label: 'Category', placeholder: 'Ophthalmology clinic' },
  { name: 'address', label: 'Address', placeholder: 'Street, area…' },
  { name: 'city', label: 'City', placeholder: 'Ujjain' },
  { name: 'state', label: 'State', placeholder: 'Madhya Pradesh' },
  { name: 'website', label: 'Website', type: 'url', placeholder: 'https://example.com' },
  { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 89820 66690' },
  { name: 'phoneUnformatted', label: 'Phone (unformatted)', type: 'tel', placeholder: '+918982066690' },
];

function StatusField() {
  const { register, formState: { errors } } = useFormContext<LeadFormInput>();
  const err = errors.status?.message as string | undefined;
  return (
    <div>
      <Label htmlFor="status">Status</Label>
      <select
        id="status"
        {...register('status')}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-sm transition hover:border-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950"
      >
        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      {err && <FieldError message={err} />}
      <p className="mt-1 text-xs text-slate-500">Choosing Converted moves this lead to Deals automatically.</p>
    </div>
  );
}

export function LeadForm({ defaultValues, onSubmit, submitting, submitLabel, onCancel }: {
  defaultValues?: Partial<LeadFormInput>;
  onSubmit: (v: LeadFormInput) => void | Promise<void>;
  submitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  const methods = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      title: '', categoryName: '', address: '', city: '', state: '',
      website: '', phone: '', phoneUnformatted: '', status: 'New', placeId: '',
      ...defaultValues,
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          {ORDER.slice(0, 2).map((f) => (
            <TextField key={f.name} name={f.name} label={f.label} type={f.type} placeholder={f.placeholder} />
          ))}
        </div>
        {ORDER.slice(2).map((f) => (
          <TextField key={f.name} name={f.name} label={f.label} type={f.type} placeholder={f.placeholder} />
        ))}
        <div className="grid gap-4 sm:grid-cols-2">
          <StatusField />
          <TextField name="placeId" label="Place ID (optional)" placeholder="ChIJ…" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button>
        </div>
      </form>
    </FormProvider>
  );
}
