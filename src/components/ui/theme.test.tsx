import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge, Button, PageHeader, EmptyState } from './primitives';

describe('Sosapient purple brand design system', () => {
  it('Button renders all variants with purple primary treatment', () => {
    const { unmount } = render(<Button variant="primary">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' }).className).toMatch(/bg-brand-600/);
    unmount();
  });

  it.each(['secondary', 'outline', 'ghost', 'destructive'] as const)('Button variant %s renders', (variant) => {
    const { unmount } = render(<Button variant={variant}>{variant}</Button>);
    expect(screen.getByRole('button', { name: variant })).toBeInTheDocument();
    unmount();
  });

  it('Badge uses semantic tones, never red for every status', () => {
    const { unmount } = render(
      <>
        <Badge tone="success">Active</Badge>
        <Badge tone="warning">Disabled</Badge>
        <Badge tone="brand">Admin</Badge>
      </>
    );
    expect(screen.getByText('Active').className).toMatch(/text-success-700/);
    expect(screen.getByText('Disabled').className).toMatch(/text-warning-700/);
    expect(screen.getByText('Admin').className).toMatch(/bg-brand-600/);
    unmount();
  });

  it('PageHeader renders breadcrumb, title, and actions', () => {
    render(<PageHeader title="User management" breadcrumb="Home / Admin / Users" actions={<button>New</button>} />);
    expect(screen.getByText('User management')).toBeInTheDocument();
    expect(screen.getByText('Home / Admin / Users')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument();
  });

  it('EmptyState renders title and description accessibly', () => {
    render(<EmptyState title="No users found" description="Try adjusting your filter." />);
    expect(screen.getByText('No users found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filter.')).toBeInTheDocument();
  });

  it('sidebar preference persists via localStorage (UI pref only)', async () => {
    localStorage.setItem('crm.sidebarOpen', '0');
    vi.resetModules();
    const { store: fresh, toggleSidebar } = await import('../../store/store');
    expect(fresh.getState().ui.sidebarOpen).toBe(false);
    fresh.dispatch(toggleSidebar());
    expect(localStorage.getItem('crm.sidebarOpen')).toBe('1');
    localStorage.removeItem('crm.sidebarOpen');
  });

  it('no hardcoded blue remnants in theme-facing sources', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const root = process.cwd();
    const files = [
      'src/index.css',
      'src/components/ui/primitives.tsx',
      'src/components/layout/SidebarNavItem.tsx',
      'src/components/layout/CRMSidebar.tsx',
      'src/components/layout/CRMHeader.tsx',
      'tailwind.config.js',
    ];
    const src = files.map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n');
    expect(src).not.toMatch(/#2549eb/i);
    expect(src).not.toMatch(/!bg-slate/);
  });
});
