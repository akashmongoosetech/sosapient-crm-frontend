import { useNavigate, useParams } from 'react-router-dom';
import { useLead, useUpdateLead } from '../../services/leadService';
import { Card, EmptyState, PageHeader, Skeleton } from '../../components/ui/primitives';
import { LeadForm } from './components/LeadForm';
import type { LeadFormInput } from '../../lib/leadValidators';

export default function LeadEditPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const lead = useLead(id);
  const update = useUpdateLead(id || '');

  function onSubmit(v: LeadFormInput) {
    update.mutate(v as unknown as Record<string, unknown>, {
      onSuccess: (result) => {
        if ('converted' in result && result.deal) nav(`/deals/${result.deal.id}`, { replace: true });
        else if ('lead' in result && result.lead) nav(`/leads/${result.lead.id}`, { replace: true });
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Edit lead" breadcrumb="Home / Leads / Edit" />
      {lead.isLoading ? (
        <Card className="space-y-3 p-6" aria-label="Loading lead"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-2/3" /></Card>
      ) : lead.isError || !lead.data ? (
        <Card><EmptyState title="Lead not found" description="It may have been deleted. Return to the list to continue." action={<button type="button" onClick={() => nav('/leads')} className="text-sm font-semibold text-brand-600 hover:underline">Back to leads</button>} /></Card>
      ) : (
        <Card className="p-5 sm:p-6">
          <LeadForm
            defaultValues={{
              title: lead.data.title, categoryName: lead.data.categoryName, address: lead.data.address,
              city: lead.data.city, state: lead.data.state, website: lead.data.website,
              phone: lead.data.phone, phoneUnformatted: lead.data.phoneUnformatted,
              status: lead.data.status, placeId: lead.data.placeId,
            }}
            onSubmit={onSubmit} submitting={update.isPending} submitLabel="Save Changes" onCancel={() => nav(`/leads/${id}`)}
          />
          <p className="mt-4 text-xs text-slate-500">Only the fields above are updated — all additional imported data is preserved.</p>
        </Card>
      )}
    </div>
  );
}
