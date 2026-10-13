import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { signupSchema, type SignupInput } from '../../lib/validators';
import { useAuth } from '../../context/AuthContext';
import { TextField, PasswordField } from '../../components/forms/fields';
import { Button, Card, FieldError } from '../../components/ui/primitives';
import { Avatar } from '../../components/common/Avatar';
import { BrandLogo } from '../../components/common/BrandLogo';

const ORDER: { name: keyof SignupInput; label: string; type?: string; placeholder?: string; auto?: string }[] = [
  { name: 'firstName', label: 'First name', placeholder: 'Ava', auto: 'given-name' },
  { name: 'lastName', label: 'Last name', placeholder: 'Stone', auto: 'family-name' },
  { name: 'email', label: 'Email address', type: 'email', placeholder: 'ava@company.com', auto: 'email' },
  { name: 'mobileNumber', label: 'Mobile number', type: 'tel', placeholder: '+14155550101', auto: 'tel' },
  { name: 'username', label: 'Username', placeholder: 'ava.stone', auto: 'username' },
  { name: 'profilePicUrl', label: 'Profile picture URL (HTTPS, optional)', type: 'url', placeholder: 'https://…', auto: 'url' },
];

export default function SignupPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [serverError, setServerError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const methods = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { firstName: '', lastName: '', email: '', mobileNumber: '', username: '', profilePicUrl: '', password: '', confirmPassword: '', acceptTerms: false as unknown as true } });
  const { handleSubmit, formState: { isSubmitting }, watch } = methods;
  const pic = watch('profilePicUrl');

  async function onSubmit(v: SignupInput) {
    setServerError(''); setFieldErrors({});
    try {
      const user = await register(v);
      toast.success(`Account created — welcome, ${user.firstName}!`);
      nav('/dashboard', { replace: true });
    } catch (e: unknown) {
      const err = e as { message?: string; errors?: { field: string; message: string }[] };
      const map: Record<string, string> = {};
      for (const f of err.errors || []) map[f.field] = f.message;
      setFieldErrors(map);
      setServerError(err.message || 'Sign-up failed');
      toast.error(err.message || 'Sign-up failed');
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-10 text-white lg:flex">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-black/20 blur-2xl" />
        <div className="relative flex items-center gap-3 font-bold"><BrandLogo height={38} /><span>Sosapient CRM</span></div>
        <div className="relative"><h2 className="text-3xl font-bold tracking-tight">Create your workspace account.</h2><p className="mt-3 max-w-sm text-brand-100">New accounts join as managers. Admin access is granted only by an existing administrator — never via self sign-up.</p></div>
        <p className="relative text-xs text-brand-200">Strong password policy · E.164 phone normalization · HTTPS avatars only</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card className="p-8">
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">Fields are in the required order. All new sign-ups become managers.</p>
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  {ORDER.slice(0, 2).map((f) => <TextField key={f.name} name={f.name} label={f.label} type={f.type} placeholder={f.placeholder} autoComplete={f.auto} />)}
                </div>
                {ORDER.slice(2).map((f) => (
                  <div key={f.name}>
                    <TextField name={f.name} label={f.label} type={f.type} placeholder={f.placeholder} autoComplete={f.auto} />
                    {fieldErrors[f.name] && <FieldError message={fieldErrors[f.name]} />}
                  </div>
                ))}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <Avatar url={pic} name={`${watch('firstName')} ${watch('lastName')}`} />
                  <p className="text-xs text-slate-500">Live avatar preview. A default avatar shows when empty or if the image fails to load. Only HTTPS URLs are accepted.</p>
                </div>
                <PasswordField name="password" label="Password (min 10 chars, upper + lower + number + symbol)" />
                <PasswordField name="confirmPassword" label="Confirm password" />
                <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" {...methods.register('acceptTerms')} className="mt-1 h-4 w-4 accent-brand-600" />
                  I accept the terms of use and understand my account will be created as a manager.
                </label>
                {methods.formState.errors.acceptTerms && <FieldError message={methods.formState.errors.acceptTerms.message as string} />}
                {serverError && <FieldError message={serverError} />}
                <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
              </form>
            </FormProvider>
            <p className="mt-4 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link></p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
