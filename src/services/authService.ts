import { apiFetch, tokenStore } from './apiClient';
import type { ApiEnvelope, User } from '../types';

export const authService = {
  async register(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false);
    tokenStore.set(json.data.accessToken);
    return json.data;
  },
  async login(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{ user: User; accessToken: string }>>('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false);
    tokenStore.set(json.data.accessToken);
    return json.data;
  },
  async me() {
    const json = await apiFetch<ApiEnvelope<{ user: User }>>('/auth/me');
    return json.data.user;
  },
  async logout() {
    try { await apiFetch('/auth/logout', { method: 'POST' }, false); } catch { /* ignore */ }
    tokenStore.set(null);
  },
  async patchMe(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{ user: User }>>('/users/me', { method: 'PATCH', body: JSON.stringify(body) });
    return json.data.user;
  },
  async changePassword(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{}>>('/users/me/password', { method: 'PATCH', body: JSON.stringify(body) });
    return json;
  },
  async forgotPassword(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{ message: string }>>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }, false);
    return json.data;
  },
  async verifyResetOtp(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{ resetToken: string; expiresInSeconds: number }>>('/auth/verify-reset-otp', { method: 'POST', body: JSON.stringify(body) }, false);
    return json.data;
  },
  async resendResetOtp(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{ message: string }>>('/auth/resend-reset-otp', { method: 'POST', body: JSON.stringify(body) }, false);
    return json.data;
  },
  async resetPassword(body: Record<string, unknown>) {
    const json = await apiFetch<ApiEnvelope<{}>>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }, false);
    return json;
  },
};
