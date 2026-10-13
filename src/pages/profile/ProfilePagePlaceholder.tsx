import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { profileSchema, passwordChangeSchema, type ProfileInput, type PasswordChangeInput } from '../../lib/validators';
import { Avatar } from '../../components/common/Avatar';
import { TextField, PasswordField } from '../../components/forms/fields';
import { Badge, Button, Card, FieldError, PageHeader } from '../../components/ui/primitives';

function capitalizeRole(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

interface ServerError {
  message?: string;
  errors?: { field: string; message: string }[];
}

function ProfileForm() {
  const { user, updateProfile } = useAuth();
  const [serverError, setServerError] = useState('');
  const methods = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      mobileNumber: user?.mobileNumber || '',
      profilePicUrl: user?.profilePicUrl || '',
    },
  });
  const { handleSubmit, formState: { isSubmitting }, watch, setError } = methods;
  const pic = watch('profilePicUrl');
  const name = `${watch('firstName')} ${watch('lastName')}`.trim() || 'Account';

  async function onSubmit(v: ProfileInput) {
    setServerError('');
    try {
      await updateProfile(v as unknown as Record<string, unknown>);
      toast.success('Profile updated');
    } catch (e: unknown) {
      const err = e as ServerError;
      for (const f of err.errors || []) {
        if (['firstName', 'lastName', 'email', 'mobileNumber', 'profilePicUrl'].includes(f.field)) {
          setError(f.field as keyof ProfileInput, { message: f.message });
        }
      }
      const msg = err.message || 'Could not update profile';
      setServerError(msg);
      toast.error(msg);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <Avatar url={pic} name={name} size={48} />
          <p className="text-xs text-slate-500">Live avatar preview. Only HTTPS image URLs are accepted.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField name="firstName" label="First name" autoComplete="given-name" />
          <TextField name="lastName" label="Last name" autoComplete="family-name" />
        </div>
        <TextField name="email" label="Email address" type="email" autoComplete="email" />
        <TextField name="mobileNumber" label="Mobile number" type="tel" autoComplete="tel" />
        <TextField name="profilePicUrl" label="Profile picture URL" type="url" placeholder="https://…" autoComplete="url" />
        {serverError && <FieldError message={serverError} />}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Changes'}</Button>
      </form>
    </FormProvider>
  );
}

function PasswordForm() {
  const [serverError, setServerError] = useState('');
  const methods = useForm<PasswordChangeInput>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });
  const { handleSubmit, formState: { isSubmitting }, reset, setError } = methods;

  async function onSubmit(v: PasswordChangeInput) {
    setServerError('');
    try {
      await authService.changePassword(v as unknown as Record<string, unknown>);
      reset();
      toast.success('Password changed successfully');
    } catch (e: unknown) {
      const err = e as ServerError;
      for (const f of err.errors || []) {
        if (['currentPassword', 'newPassword', 'confirmNewPassword'].includes(f.field)) {
          setError(f.field as keyof PasswordChangeInput, { message: f.message });
        }
      }
      const msg = err.message || 'Could not change password';
      setServerError(msg);
      toast.error(msg);
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <PasswordField name="currentPassword" label="Current password" />
        <PasswordField name="newPassword" label="New password (min 10 chars, upper + lower + number + symbol)" />
        <PasswordField name="confirmNewPassword" label="Confirm new password" />
        {serverError && <FieldError message={serverError} />}
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Changing…' : 'Change Password'}</Button>
      </form>
    </FormProvider>
  );
}

export default function ProfilePagePlaceholder() {
  const { user } = useAuth();
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Account';

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="My profile" breadcrumb="Home / Profile" />
      <Card className="flex flex-wrap items-center gap-4 p-6">
        <Avatar url={user?.profilePicUrl} name={fullName} size={64} />
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold tracking-tight">{fullName}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge tone={user?.role === 'admin' ? 'brand' : 'neutral'}>{user ? capitalizeRole(user.role) : ''}</Badge>
          </div>
          {user?.email && <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold">Profile information</h3>
        <ProfileForm key={user?.id} />
      </Card>
      <Card className="p-6">
        <h3 className="mb-1 text-sm font-semibold">Change password</h3>
        <p className="mb-4 text-xs text-slate-500">You will stay signed in on this device after changing your password.</p>
        <PasswordForm />
      </Card>
    </div>
  );
}
