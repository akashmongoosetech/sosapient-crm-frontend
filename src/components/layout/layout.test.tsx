import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

vi.mock('../../context/AuthContext', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../context/AuthContext';
import { store } from '../../store/store';
import type { User } from '../../types';
import { CRMSidebar } from './CRMSidebar';
import { MobileSidebar } from './MobileSidebar';
import { CRMHeader } from './CRMHeader';
import { UserProfileDropdown } from './UserProfileDropdown';
import ModulePlaceholderPage from '../../pages/placeholders/ModulePlaceholderPage';

const adminUser = {
  id: '1', firstName: 'Akash', lastName: 'Raikwar', email: 'akash@example.com',
  mobileNumber: '+14155550101', username: 'akash', profilePicUrl: '',
  role: 'admin' as const, isActive: true, emailVerified: false, mobileVerified: false,
  lastLoginAt: null, createdAt: '', updatedAt: '',
};
const managerUser = { ...adminUser, id: '2', firstName: 'Priya', lastName: 'Sharma', email: 'priya@example.com', role: 'manager' as const };
const logoutMock = vi.fn();

function authAs(user: User) {
  (useAuth as Mock).mockReturnValue({
    user, isAuthenticated: true, isInitializing: false,
    login: vi.fn(), register: vi.fn(), logout: logoutMock,
    refreshSession: vi.fn(), reloadCurrentUser: vi.fn(),
  });
}

function shell(ui: React.ReactNode, path = '/dashboard') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </Provider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CRMSidebar role-based navigation', () => {
  it('shows all six items in order for admin, including Users', () => {
    authAs(adminUser);
    shell(<CRMSidebar />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const links = within(nav).getAllByRole('link').map((a) => a.textContent);
    expect(links).toEqual(['Dashboard', 'Leads', 'Deals', 'Accounts', 'Contacts', 'Users']);
    expect(within(nav).getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/users');
  });

  it('hides Users for manager', () => {
    authAs(managerUser);
    shell(<CRMSidebar />);
    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(within(nav).queryByRole('link', { name: 'Users' })).toBeNull();
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
  });

  it('highlights the active item', () => {
    authAs(managerUser);
    shell(<CRMSidebar />, '/leads');
    expect(screen.getByRole('link', { name: 'Leads' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('CRMHeader profile trigger', () => {
  it('shows name and capitalized role but never the email', () => {
    authAs(adminUser);
    const ref = { current: null };
    shell(<CRMHeader onOpenMobileNav={() => {}} menuButtonRef={ref as never} />);
    expect(screen.getByText('Akash Raikwar')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.queryByText('akash@example.com')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});

describe('UserProfileDropdown', () => {
  it('opens a menu with profile summary, My Profile, and Log Out', async () => {
    authAs(managerUser);
    shell(<UserProfileDropdown />);
    await userEvent.click(screen.getByRole('button', { name: /profile menu for priya sharma/i }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('priya@example.com')).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: /my profile/i })).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
  });

  it('Log Out calls the existing auth logout', async () => {
    authAs(managerUser);
    shell(<UserProfileDropdown />);
    await userEvent.click(screen.getByRole('button', { name: /profile menu/i }));
    await userEvent.click(screen.getByRole('menuitem', { name: /log out/i }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape', async () => {
    authAs(managerUser);
    shell(<UserProfileDropdown />);
    await userEvent.click(screen.getByRole('button', { name: /profile menu/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});

describe('MobileSidebar drawer', () => {
  it('renders nothing when closed and nav items when open', () => {
    authAs(managerUser);
    const ref = { current: null };
    const { rerender } = shell(
      <MobileSidebar open={false} onClose={() => {}} triggerRef={ref as never} />
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    rerender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <MobileSidebar open onClose={() => {}} triggerRef={ref as never} />
        </MemoryRouter>
      </Provider>
    );
    const dialog = screen.getByRole('dialog', { name: 'CRM navigation' });
    expect(within(dialog).getByRole('link', { name: 'Leads' })).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    authAs(managerUser);
    const onClose = vi.fn();
    const ref = { current: null };
    shell(<MobileSidebar open onClose={onClose} triggerRef={ref as never} />);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('ModulePlaceholderPage', () => {
  it('shows the future-phase message without fake data', () => {
    shell(<ModulePlaceholderPage module="leads" />);
    expect(screen.getByText('This module will be implemented in a future development phase.')).toBeInTheDocument();
  });
});
