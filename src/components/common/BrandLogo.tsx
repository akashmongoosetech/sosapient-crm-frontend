import { useState } from 'react';
import { cn } from '../../utils';

export const LOGO_SRC = '/logo.png';
export const LOGO_ALT = 'Sosapient CRM logo';

/** Compact purple "S" tile used when the logo image can't load or space is tight. */
export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white shadow-sm',
        className
      )}
    >
      S
    </span>
  );
}

interface BrandLogoProps {
  /** Height of the logo image in px. Width scales automatically (aspect preserved). */
  height?: number;
  className?: string;
  /** Wrap in a white chip so the logo stays legible on dark/colored surfaces. */
  chip?: boolean;
}

/**
 * Official Sosapient CRM logo. Falls back to the BrandMark tile if the
 * image fails to load. Never stretches: object-contain + auto width.
 */
export function BrandLogo({ height = 36, className, chip = true }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return <BrandMark size={height} className={className} />;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center overflow-hidden',
        chip && 'rounded-lg bg-white px-2 py-1 shadow-sm',
        className
      )}
    >
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        style={{ height }}
        width={Math.round(height * 4.4)}
        className="w-auto object-contain"
        onError={() => setFailed(true)}
        loading="eager"
      />
    </span>
  );
}
