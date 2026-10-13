import { Link, useParams } from 'react-router-dom';
import { useDeal } from '../../services/dealService';
import { Card, EmptyState, PageHeader, Skeleton } from '../../components/ui/primitives';
import { DealInformation } from './components/DealInformation';
import { EntrySection } from './components/EntrySection';

export default function DealDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const deal = useDeal(id);

  if (deal.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4" aria-label="Loading deal">
        <Skeleton className="h-8 w-1/2" />
        <Card className="space-y-3 p-6"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-2/3" /></Card>
      </div>
    );
  }
  if (deal.isError || !deal.data) {
    return <Card><EmptyState title="Deal not found" description="It may have been removed." action={<Link to="/deals" className="text-sm font-semibold text-brand-600 hover:underline">Back to deals</Link>} /></Card>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title={deal.data.title} breadcrumb="Home / Deals / Details" />
      <section aria-labelledby="deal-info-heading">
        <h2 id="deal-info-heading" className="sr-only">Client information</h2>
        <DealInformation deal={deal.data} />
      </section>
      <section aria-label="Client requirements">
        <EntrySection dealId={deal.data.id} kind="requirement" />
      </section>
      <section aria-label="Project progress">
        <EntrySection dealId={deal.data.id} kind="progress" />
      </section>
    </div>
  );
}
