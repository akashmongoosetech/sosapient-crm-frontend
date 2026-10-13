import { useNavigate } from 'react-router-dom';
import { useCreateLead } from '../../services/leadService';
import { Card, PageHeader } from '../../components/ui/primitives';
import { LeadForm } from './components/LeadForm';
import type { LeadFormInput } from '../../lib/leadValidators';

export default function LeadCreatePage() {
  const nav = useNavigate();
  const create = useCreateLead();

  function onSubmit(v: LeadFormInput) {
    create.mutate(v as unknown as Record<string, unknown>, {
      onSuccess: (lead) => nav(`/leads/${lead.id}`, { replace: true }),
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader title="Add lead" breadcrumb="Home / Leads / New" description="Enter the lead's core details. Extra imported data is preserved automatically." />
      <Card className="p-5 sm:p-6">
        <LeadForm onSubmit={onSubmit} submitting={create.isPending} submitLabel="Save Lead" onCancel={() => nav('/leads')} />
      </Card>
    </div>
  );
}
