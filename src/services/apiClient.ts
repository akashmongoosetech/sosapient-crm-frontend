const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let accessToken: string | null = null; // memory only
export const tokenStore = {
  get: () => accessToken,
  set: (t: string | null) => { accessToken = t; },
};

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
  if (!res.ok) { tokenStore.set(null); return null; }
  const json = await res.json();
  const t = json?.data?.accessToken ?? null;
  tokenStore.set(t);
  return t;
}

export function refreshSession(): Promise<string | null> {
  if (!refreshPromise) refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((init.headers as Record<string, string>) || {}) };
  if (tokenStore.get()) headers.Authorization = `Bearer ${tokenStore.get()}`;
  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });
  if (res.status === 401 && retry && tokenStore.get() !== undefined) {
    const t = await refreshSession();
    if (t) return apiFetch<T>(path, init, false);
  }
  const json = await res.json().catch(() => ({ success: false, message: 'Network error', errors: [] }));
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed') as Error & { status?: number; errors?: unknown };
    err.status = res.status; err.errors = json.errors;
    throw err;
  }
  return json as T;
}

/**
 * Multipart upload helper. Never sets Content-Type manually — the browser
 * generates the boundary. Auth + refresh behavior mirrors apiFetch.
 */
export async function apiUpload<T>(path: string, form: FormData, method = 'POST'): Promise<T> {
  const send = async (retry: boolean): Promise<T> => {
    const headers: Record<string, string> = {};
    if (tokenStore.get()) headers.Authorization = `Bearer ${tokenStore.get()}`;
    const res = await fetch(`${BASE}${path}`, { method, body: form, headers, credentials: 'include' });
    if (res.status === 401 && retry) {
      const t = await refreshSession();
      if (t) return send(false);
    }
    const json = await res.json().catch(() => ({ success: false, message: 'Network error', errors: [] }));
    if (!res.ok) {
      const err = new Error(json.message || 'Upload failed') as Error & { status?: number; errors?: unknown };
      err.status = res.status; err.errors = json.errors;
      throw err;
    }
    return json as T;
  };
  return send(true);
}

/** Absolute URL for an API-relative file reference (images served by the API). */
export function apiFileUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE.replace(/\/api$/, '')}${url}`;
}
