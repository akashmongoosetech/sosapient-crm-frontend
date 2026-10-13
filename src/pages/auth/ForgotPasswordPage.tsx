import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { forgotPasswordSchema, type ForgotPasswordInput } from '../../lib/validators';
import { authService } from '../../services/authService';
import { TextField } from '../../components/forms/fields';
import { Button, FieldError } from '../../components/ui/primitives';
import { AuthSplit } from './AuthSplit';

export default function ForgotPasswordPage() {
  const nav = useNavigate();
  const [serverError, setServerError] = useState('');
  const methods = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const { handleSubmit, formState: { isSubmitting } } = methods;

  async function onSubmit(v: ForgotPasswordInput) {
    setServerError('');
    try {
      const data = await authService.forgotPassword(v);
      toast.success('Verification code sent');
      nav('/verify-reset-otp', { replace: true, state: { email: v.email, requestedAt: Date.now(), notice: data.message } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setServerError(msg);
      toast.error(msg);
    }
  }

  return (
    <AuthSplit title="Forgot password" subtitle="Enter your registered email address and we'll send a 6-digit verification code.">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <TextField name="email" label="Registered email address" type="email" autoComplete="email" placeholder="you@company.com" />
          {serverError && <FieldError message={serverError} />}
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Sending…' : 'Send verification code'}</Button>
        </form>
      </FormProvider>
    </AuthSplit>
  );
}
