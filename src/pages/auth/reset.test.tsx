import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '../../lib/validators';
import VerifyResetOtpPage from './VerifyResetOtpPage';
import ResetPasswordPage from './ResetPasswordPage';

describe('reset schemas', () => {
  it('forgot-password requires a valid email', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'nope' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
  });
  it('otp must be exactly six digits', () => {
    expect(verifyOtpSchema.safeParse({ otp: '123456' }).success).toBe(true);
    for (const bad of ['12345', '1234567', 'abcdef', '12 34', '']) {
      expect(verifyOtpSchema.safeParse({ otp: bad }).success).toBe(false);
    }
  });
  it('reset enforces policy and matching confirmation', () => {
    const good = { newPassword: 'N3w!StrongPass9', confirmNewPassword: 'N3w!StrongPass9' };
    expect(resetPasswordSchema.safeParse(good).success).toBe(true);
    expect(resetPasswordSchema.safeParse({ ...good, confirmNewPassword: 'other' }).success).toBe(false);
    expect(resetPasswordSchema.safeParse({ newPassword: 'weak', confirmNewPassword: 'weak' }).success).toBe(false);
  });
});

vi.mock('../../services/authService', () => ({
  authService: {
    verifyResetOtp: vi.fn(),
    resendResetOtp: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

import { authService } from '../../services/authService';

const mocked = authService as unknown as {
  verifyResetOtp: ReturnType<typeof vi.fn>;
  resendResetOtp: ReturnType<typeof vi.fn>;
  resetPassword: ReturnType<typeof vi.fn>;
};

beforeEach(() => { vi.clearAllMocks(); });

function renderVerify(state = { email: 'a@b.com', requestedAt: Date.now() }) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/verify-reset-otp', state }]}>
      <Routes>
        <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
        <Route path="/forgot-password" element={<div>forgot page</div>} />
        <Route path="/reset-password" element={<div>reset page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('VerifyResetOtpPage', () => {
  it('splits a pasted code across boxes and verifies', async () => {
    const user = userEvent.setup();
    mocked.verifyResetOtp.mockResolvedValue({ resetToken: 'tok', expiresInSeconds: 300 });
    renderVerify();
    const first = screen.getByLabelText('Digit 1 of 6');
    await user.click(first);
    await user.paste('482916');
    expect((screen.getByLabelText('Digit 6 of 6') as HTMLInputElement).value).toBe('6');
    await user.click(screen.getByRole('button', { name: /verify otp/i }));
    await waitFor(() => expect(mocked.verifyResetOtp).toHaveBeenCalledWith({ email: 'a@b.com', otp: '482916' }));
    expect(await screen.findByText('reset page')).toBeInTheDocument();
  });

  it('rejects incomplete codes client-side without calling the API', async () => {
    const user = userEvent.setup();
    renderVerify();
    await user.type(screen.getByLabelText('Digit 1 of 6'), '4');
    await user.click(screen.getByRole('button', { name: /verify otp/i }));
    expect(screen.getByText('Enter the 6-digit code')).toBeInTheDocument();
    expect(mocked.verifyResetOtp).not.toHaveBeenCalled();
  });

  it('shows server errors and redirects without state', async () => {
    const user = userEvent.setup();
    mocked.verifyResetOtp.mockRejectedValue(Object.assign(new Error('Incorrect code'), { status: 400 }));
    renderVerify();
    await user.type(screen.getByLabelText('Digit 1 of 6'), '000000');
    await user.click(screen.getByRole('button', { name: /verify otp/i }));
    expect(await screen.findByText('Incorrect code')).toBeInTheDocument();
  });

  it('redirects to forgot-password when opened without an email', async () => {
    render(
      <MemoryRouter initialEntries={[{ pathname: '/verify-reset-otp', state: {} }]}>
        <Routes>
          <Route path="/verify-reset-otp" element={<VerifyResetOtpPage />} />
          <Route path="/forgot-password" element={<div>forgot page</div>} />
        </Routes>
      </MemoryRouter>
    );
    expect(await screen.findByText('forgot page')).toBeInTheDocument();
  });
});

describe('ResetPasswordPage', () => {
  function renderReset(state: object = { email: 'a@b.com', resetToken: 'tok' }) {
    return render(
      <MemoryRouter initialEntries={[{ pathname: '/reset-password', state }]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/forgot-password" element={<div>forgot page</div>} />
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('submits token + matching passwords, then shows success', async () => {
    const user = userEvent.setup();
    mocked.resetPassword.mockResolvedValue({ success: true });
    renderReset();
    await user.type(screen.getByLabelText('New password'), 'N3w!StrongPass9');
    await user.type(screen.getByLabelText('Confirm new password'), 'N3w!StrongPass9');
    await user.click(screen.getByRole('button', { name: /set new password/i }));
    await waitFor(() => expect(mocked.resetPassword).toHaveBeenCalledWith(
      expect.objectContaining({ resetToken: 'tok', newPassword: 'N3w!StrongPass9' })
    ));
    expect(await screen.findByText(/password has been updated/i)).toBeInTheDocument();
  });

  it('blocks mismatched confirmation without calling the API', async () => {
    const user = userEvent.setup();
    renderReset();
    await user.type(screen.getByLabelText('New password'), 'N3w!StrongPass9');
    await user.type(screen.getByLabelText('Confirm new password'), 'Other123!x');
    await user.click(screen.getByRole('button', { name: /set new password/i }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(mocked.resetPassword).not.toHaveBeenCalled();
  });

  it('surfaces expired-token errors from the server', async () => {
    const user = userEvent.setup();
    mocked.resetPassword.mockRejectedValue(Object.assign(new Error('Reset session expired'), { status: 400 }));
    renderReset();
    await user.type(screen.getByLabelText('New password'), 'N3w!StrongPass9');
    await user.type(screen.getByLabelText('Confirm new password'), 'N3w!StrongPass9');
    await user.click(screen.getByRole('button', { name: /set new password/i }));
    expect(await screen.findByText('Reset session expired')).toBeInTheDocument();
  });
});
