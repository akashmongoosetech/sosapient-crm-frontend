import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '../../lib/validators';
import { useAuth } from '../../context/AuthContext';
import { TextField, PasswordField } from '../../components/forms/fields';
import { Button, Card, FieldError } from '../../components/ui/primitives';
import { BrandLogo } from '../../components/common/BrandLogo';
import { isSafeNext } from '../../utils';

function BrandPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-10 text-white lg:flex">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-black/20 blur-2xl" />
      <div className="relative flex items-center gap-3 font-bold"><BrandLogo height={38} /><span>Sosapient CRM</span></div>
      <div className="relative">
        <h2 className="text-3xl font-bold leading-tight tracking-tight">Customer relationships,<br />beautifully organized.</h2>
        <p className="mt-3 max-w-sm text-brand-100">Secure role-based access for admins and managers. Short-lived sessions, rotating refresh tokens, and audit-ready administration.</p>
      </div>
      <p className="relative text-xs text-brand-200">Protected by HttpOnly rotating sessions · No tokens in browser storage</p>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [serverError, setServerError] = useState('');
  const methods = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: '', password: '', rememberMe: false } });
  const { handleSubmit, formState: { isSubmitting } } = methods;

  async function onSubmit(v: LoginInput) {
    setServerError('');
    try {
      const user = await login(v);
      toast.success(`Welcome back, ${user.firstName}`);
      nav(isSafeNext(params.get('next')), { replace: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      setServerError(msg);
      toast.error(msg);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="p-8">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">Use your email, username, or mobile number.</p>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <TextField name="identifier" label="Email, username, or mobile number" autoComplete="username" placeholder="you@company.com" />
                <PasswordField name="password" label="Password" />
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" {...methods.register('rememberMe')} className="h-4 w-4 accent-brand-600" /> Remember me (7-day session)
                </label>
                {serverError && <FieldError message={serverError} />}
                <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
              </form>
            </FormProvider>
            <div className="mt-4 flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="font-semibold text-brand-600 hover:underline">Forgot password?</Link>
              <p className="text-slate-500">New here? <Link to="/signup" className="font-semibold text-brand-600 hover:underline">Create an account</Link></p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
