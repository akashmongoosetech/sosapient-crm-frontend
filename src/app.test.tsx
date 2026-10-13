import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { PasswordField } from './components/forms/fields';

function Harness() {
  const m = useForm({ defaultValues: { password: '' } });
  return <FormProvider {...m}><PasswordField name="password" label="Password" /></FormProvider>;
}

describe('password visibility + guards utils', () => {
  it('toggles password visibility with accessible labels', async () => {
    render(<Harness />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
    await userEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(input.type).toBe('text');
    await userEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input.type).toBe('password');
  });
  it('isSafeNext blocks open redirects', async () => {
    const { isSafeNext } = await import('./utils');
    expect(isSafeNext('/dashboard')).toBe('/dashboard');
    expect(isSafeNext('https://evil.com')).toBe('/dashboard');
    expect(isSafeNext('//evil.com')).toBe('/dashboard');
    expect(isSafeNext(null)).toBe('/dashboard');
  });
  it('auth service never uses localStorage (static check)', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const root = process.cwd();
    const src = fs.readFileSync(path.join(root, 'src/services/authService.ts'), 'utf8') + fs.readFileSync(path.join(root, 'src/services/apiClient.ts'), 'utf8') + fs.readFileSync(path.join(root, 'src/context/AuthContext.tsx'), 'utf8');
    expect(src).not.toMatch(/localStorage|sessionStorage/);
  });
});
