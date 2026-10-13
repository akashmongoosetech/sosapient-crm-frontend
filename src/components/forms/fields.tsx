import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Input, Label, FieldError } from '../ui/primitives';

export function TextField({ name, label, ...rest }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const { register, formState: { errors } } = useFormContext();
  const err = (errors[name]?.message as string | undefined);
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} {...register(name)} {...rest} aria-invalid={!!err} />
      <FieldError message={err} />
    </div>
  );
}

export function PasswordField({ name, label }: { name: string; label: string }) {
  const [show, setShow] = useState(false);
  const { register, formState: { errors } } = useFormContext();
  const err = (errors[name]?.message as string | undefined);
  return (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input id={name} type={show ? 'text' : 'password'} autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} {...register(name)} aria-invalid={!!err} className="pr-11" />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-500 hover:text-slate-700">
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <FieldError message={err} />
    </div>
  );
}
