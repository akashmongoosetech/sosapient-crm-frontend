import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authService } from '../../services/authService';
import { Button, FieldError } from '../../components/ui/primitives';
import { AuthSplit } from './AuthSplit';

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

interface VerifyState {
  email?: string;
  requestedAt?: number;
  notice?: string;
}

function formatClock(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function VerifyResetOtpPage() {
  const nav = useNavigate();
  const loc = useLocation();
  const state = (loc.state || {}) as VerifyState;
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(() => Date.now() + RESEND_COOLDOWN_MS);
  const [now, setNow] = useState(Date.now());
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const email = state.email || '';
  const requestedAt = state.requestedAt || Date.now();
  const remaining = useMemo(() => OTP_TTL_MS - (now - requestedAt), [now, requestedAt]);
  const cooldownLeft = Math.max(0, cooldownUntil - now);
  const expired = remaining <= 0;

  useEffect(() => {
    if (!email) nav('/forgot-password', { replace: true });
  }, [email, nav]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  function setDigit(i: number, v: string) {
    const d = v.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = d;
      return next;
    });
    if (d && i < 5) inputs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!text) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < 6; i++) next[i] = text[i] || next[i];
      return next;
    });
    inputs.current[Math.min(text.length, 5)]?.focus();
  }

  async function onVerify() {
    const otp = digits.join('');
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code');
      return;
    }
    setError('');
    setVerifying(true);
    try {
      const data = await authService.verifyResetOtp({ email, otp });
      toast.success('Code verified');
      nav('/reset-password', { replace: true, state: { email, resetToken: data.resetToken } });
    } catch (e: unknown) {
      const err = e as Error & { status?: number };
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setError(msg);
      if (err.status !== 429) {
        setDigits(Array(6).fill(''));
        inputs.current[0]?.focus();
      }
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  }

  async function onResend() {
    setError('');
    setResending(true);
    try {
      await authService.resendResetOtp({ email });
      toast.success('A new code was sent');
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      setDigits(Array(6).fill(''));
      inputs.current[0]?.focus();
    } catch (e: unknown) {
      const err = e as Error & { status?: number; retryAfter?: number };
      if (err.status === 429 && typeof err.retryAfter === 'number') {
        setCooldownUntil(Date.now() + err.retryAfter * 1000);
      }
      const msg = err instanceof Error ? err.message : 'Resend failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthSplit title="Enter verification code" subtitle={`We sent a 6-digit code to ${email || 'your email'}. It expires in ${formatClock(remaining)}.`}>
      {state.notice && <p className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{state.notice}</p>}
      <div className="flex gap-2" role="group" aria-label="Six-digit verification code" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { inputs.current[i] = el; }}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1} of 6`}
            maxLength={1}
            disabled={verifying}
            className="h-12 w-full rounded-lg border border-slate-300 bg-white text-center text-lg font-bold shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-brand-950"
          />
        ))}
      </div>
      {error && <div className="mt-3"><FieldError message={error} /></div>}
      {expired && <p role="alert" className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">This code has expired — use Resend to get a fresh one.</p>}
      <div className="mt-4 space-y-2">
        <Button onClick={onVerify} disabled={verifying || expired} className="w-full">{verifying ? 'Verifying…' : 'Verify OTP'}</Button>
        <Button variant="outline" onClick={onResend} disabled={resending || cooldownLeft > 0} className="w-full">
          {resending ? 'Sending…' : cooldownLeft > 0 ? `Resend code (${formatClock(cooldownLeft)})` : 'Resend code'}
        </Button>
        <p className="text-center text-sm">
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:underline">Use a different email</Link>
        </p>
      </div>
    </AuthSplit>
  );
}
