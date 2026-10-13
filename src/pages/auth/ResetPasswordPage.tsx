import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordInput } from '../../lib/validators';
import { authService } from '../../services/authService';
import { PasswordField } from '../../components/forms/fields';
import { Button, FieldError } from '../../components/ui/primitives';
import { AuthSplit } from './AuthSplit';

interface ResetState {
  email?: string;
  resetToken?: string;
}

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const state = (loc.state || {}) as ResetState;
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);
  const methods = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmNewPassword: '' },
  });
  const { handleSubmit, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (!state.resetToken) nav('/forgot-password', { replace: true });
  }, [state.resetToken, nav]);

  async function onSubmit(v: ResetPasswordInput) {
    setServerError('');
    try {
      await authService.resetPassword({ resetToken: state.resetToken, ...v });
      setDone(true);
      toast.success('Password changed — please sign in');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Reset failed';
      setServerError(msg);
      toast.error(msg);
    }
  }

  if (done) {
    return (
      <AuthSplit title="Password changed" subtitle="Your password has been updated. All other sessions were signed out for your security.">
        <Button onClick={() => nav('/login', { replace: true })} className="w-full">Back to sign in</Button>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit title="Choose a new password" subtitle="Minimum 10 characters with uppercase, lowercase, number, and symbol.">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <PasswordField name="newPassword" label="New password" />
          <PasswordField name="confirmNewPassword" label="Confirm new password" />
          {serverError && <FieldError message={serverError} />}
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Saving…' : 'Set new password'}</Button>
        </form>
      </FormProvider>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link>
      </p>
    </AuthSplit>
  );
}
