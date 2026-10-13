import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { leadFormSchema } from '../../lib/leadValidators';
import { LEAD_STATUSES, STATUS_TONE } from '../../types/lead';
import { Badge } from '../../components/ui/primitives';
import { SourceValue } from './LeadDetailsPage';

describe('lead form validation', () => {
  const good = {
    title: 'Visualeyes Hospital', categoryName: 'Clinic', address: 'Ujjain',
    city: 'Ujjain', state: 'MP', website: 'https://visualeyes-hospital.com/',
    phone: '+91 89820 66690', phoneUnformatted: '+918982066690',
    status: 'New' as const, placeId: '',
  };

  it('accepts full valid input', () => {
    expect(leadFormSchema.safeParse(good).success).toBe(true);
  });

  it('accepts title-only (phone/website optional)', () => {
    expect(leadFormSchema.safeParse({ title: 'Bare' }).success).toBe(true);
  });

  it('rejects missing title and invalid status', () => {
    expect(leadFormSchema.safeParse({ title: '' }).success).toBe(false);
    expect(leadFormSchema.safeParse({ title: 'X', status: 'Bogus' }).success).toBe(false);
  });

  it('validates website only when provided', () => {
    expect(leadFormSchema.safeParse({ title: 'X', website: '' }).success).toBe(true);
    expect(leadFormSchema.safeParse({ title: 'X', website: 'not a url' }).success).toBe(false);
    expect(leadFormSchema.safeParse({ title: 'X', website: 'example.com/clinic' }).success).toBe(true);
  });

  it('covers all five statuses with badge tones', () => {
    expect(LEAD_STATUSES).toEqual(['New', 'Whatsapp', 'Message', 'Call', 'Converted']);
    for (const s of LEAD_STATUSES) expect(STATUS_TONE[s]).toBeTruthy();
  });
});

describe('lead details rendering', () => {
  it('renders every status badge', () => {
    render(
      <MemoryRouter>
        <div>{LEAD_STATUSES.map((s) => <Badge key={s} tone={STATUS_TONE[s]}>{s}</Badge>)}</div>
      </MemoryRouter>
    );
    for (const s of LEAD_STATUSES) expect(screen.getByText(s)).toBeInTheDocument();
  });

  it('SourceValue renders nested/array/null safely as text', () => {
    const { container } = render(
      <SourceValue value={{ location: { lat: 1 }, tags: ['a', 'b'], n: null, ok: true, c: 4.7 }} />
    );
    const text = container.textContent || '';
    for (const bit of ['location', 'lat', 'tags', 'null', 'true', '4.7']) expect(text).toContain(bit);
    expect(container.querySelector('script, iframe')).toBeNull();
  });
});
