import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/primitives';
import { BrandLogo } from '../../components/common/BrandLogo';

export function AuthSplit({ title, subtitle, children, footer }: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 p-10 text-white lg:flex">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-black/20 blur-2xl" />
        <div className="relative flex items-center gap-3 font-bold"><BrandLogo height={38} /><span>Sosapient CRM</span></div>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">Secure account recovery.</h2>
          <p className="mt-3 max-w-sm text-brand-100">A one-time code protects your reset — it expires in minutes and can never be reused.</p>
        </div>
        <p className="relative text-xs text-brand-200">Hashed codes only · No plaintext secrets stored</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Card className="p-8">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mb-6 mt-1 text-sm text-slate-500">{subtitle}</p>
            {children}
            {footer ?? (
              <p className="mt-4 text-center text-sm text-slate-500">
                <Link to="/login" className="font-semibold text-brand-600 hover:underline">Back to sign in</Link>
              </p>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
