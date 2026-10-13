import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../services/dealService', () => ({
  useEntries: vi.fn(),
  useSaveEntry: vi.fn(),
  useUpdateEntry: vi.fn(),
  useDeleteEntry: vi.fn(),
}));

import { useEntries, useSaveEntry, useUpdateEntry, useDeleteEntry } from '../../services/dealService';
import { AttachmentGallery } from './components/AttachmentGallery';
import { ImageUploadField } from './components/ImageUploadField';
import { EntrySection } from './components/EntrySection';

function shell(ui: React.ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

const ATTACH = [
  { filename: 'a.png', mime: 'image/png', size: 1234, url: '/api/files/d1/f1.png' },
  { filename: 'b.webp', mime: 'image/webp', size: 2345, url: '/api/files/d1/f2.webp' },
];

describe('AttachmentGallery', () => {
  it('renders nothing without attachments; opens lightbox on click', async () => {
    const { unmount } = shell(<AttachmentGallery attachments={[]} />);
    expect(screen.queryByRole('button')).toBeNull();
    unmount();
  });

  it('opens preview dialog and closes on Escape', async () => {
    shell(<AttachmentGallery attachments={ATTACH} />);
    await userEvent.click(screen.getByRole('button', { name: /open a\.png/i }));
    expect(screen.getByRole('dialog', { name: 'a.png' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('ImageUploadField', () => {
  it('rejects unsupported extensions with a clear error', async () => {
    const onChange = vi.fn();
    shell(<ImageUploadField files={[]} onChange={onChange} />);
    const input = screen.getByLabelText('Attach images') as HTMLInputElement;
    const bad = new File(['MZ'], 'evil.exe', { type: 'application/octet-stream' });
    fireEvent.change(input, { target: { files: [bad] } });
    expect(await screen.findByText(/not a supported image/i)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts images and allows pre-save removal', async () => {
    let current: { file: File; preview: string }[] = [];
    const onChange = vi.fn((f) => { current = f; });
    const { rerender } = shell(<ImageUploadField files={[]} onChange={onChange} />);
    const input = screen.getByLabelText('Attach images') as HTMLInputElement;
    const good = new File(['png-bytes'], 'a.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [good] } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(current).toHaveLength(1);
    const qc = new QueryClient();
    rerender(
      <QueryClientProvider client={qc}>
        <MemoryRouter><ImageUploadField files={current} onChange={onChange} /></MemoryRouter>
      </QueryClientProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: /remove a\.png/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});

describe('EntrySection', () => {
  function mockEntries() {
    (useEntries as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false, isError: false,
      data: { entries: [], page: 1, limit: 20, total: 0 },
    });
    (useSaveEntry as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useUpdateEntry as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useDeleteEntry as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  }

  it('shows honest empty states per section', () => {
    mockEntries();
    shell(<EntrySection dealId="d1" kind="requirement" />);
    expect(screen.getByText('No client requirements recorded yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add requirement/i })).toBeInTheDocument();
  });

  it('progress section is independent with its own copy', () => {
    mockEntries();
    shell(<EntrySection dealId="d1" kind="progress" />);
    expect(screen.getByText('No progress updates recorded yet.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add progress/i })).toBeInTheDocument();
  });

  function mockEntriesWithAuthors() {
    mockEntries();
    (useEntries as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false, isError: false,
      data: {
        entries: [
          {
            id: 'e1', dealId: 'd1', description: 'Booking page', entryDate: '2026-10-12T00:00:00.000Z',
            attachments: [], createdBy: 'u1',
            creator: { firstName: 'Rahul', lastName: 'Sharma', profilePicUrl: 'https://example.com/rahul.png', role: 'admin' },
            createdAt: '2026-10-12T10:30:00.000Z', updatedAt: '2026-10-12T10:30:00.000Z',
          },
          {
            id: 'e2', dealId: 'd1', description: 'Legacy entry', entryDate: '2026-10-10T00:00:00.000Z',
            attachments: [], createdBy: null, creator: null,
            createdAt: '2026-10-10T09:00:00.000Z', updatedAt: '2026-10-10T09:00:00.000Z',
          },
        ],
        page: 1, limit: 20, total: 2,
      },
    });
  }

  it('shows each entry’s own creator with avatar, name, and role badge', () => {
    mockEntriesWithAuthors();
    shell(<EntrySection dealId="d1" kind="requirement" />);
    expect(screen.getByText('Rahul Sharma')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getAllByText(/Added on:/)).toHaveLength(2);
  });

  it('falls back to Unknown User for legacy entries without creator', () => {
    mockEntriesWithAuthors();
    shell(<EntrySection dealId="d1" kind="requirement" />);
    expect(screen.getByText('Unknown User')).toBeInTheDocument();
  });
});
