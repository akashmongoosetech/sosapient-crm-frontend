import { useState } from 'react';
import { AVATAR_FALLBACK } from '../../utils';

export function Avatar({ url, name, size = 40 }: { url?: string; name: string; size?: number }) {
  const [err, setErr] = useState(false);
  const src = !url || err ? AVATAR_FALLBACK : url;
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-brand-700" style={{ width: size, height: size }} title={name}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={src} alt="" onError={() => setErr(true)} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      {(!url || err) && <span className="absolute text-xs font-bold">{initials}</span>}
    </span>
  );
}
