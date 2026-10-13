import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function isSafeNext(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//')) return '/dashboard';
  return path;
}
export const AVATAR_FALLBACK = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f464.png';
