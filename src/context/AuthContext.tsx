import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { refreshSession, tokenStore } from '../services/apiClient';
import type { User } from '../types';

interface AuthCtx {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (b: Record<string, unknown>) => Promise<User>;
  register: (b: Record<string, unknown>) => Promise<User>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  reloadCurrentUser: () => Promise<User | null>;
  updateProfile: (b: Record<string, unknown>) => Promise<User>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setInit] = useState(true);
  const qc = useQueryClient();

  const reloadCurrentUser = useCallback(async () => {
    try {
      const u = await authService.me();
      setUser(u);
      return u;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const t = await refreshSession().catch(() => null);
      if (t) await reloadCurrentUser();
      setInit(false);
    })();
  }, [reloadCurrentUser]);

  const login = useCallback(async (b: Record<string, unknown>) => {
    const d = await authService.login(b);
    setUser(d.user);
    qc.invalidateQueries();
    return d.user;
  }, [qc]);

  const register = useCallback(async (b: Record<string, unknown>) => {
    const d = await authService.register(b);
    setUser(d.user);
    qc.invalidateQueries();
    return d.user;
  }, [qc]);

  const logout = useCallback(async () => {
    await authService.logout();
    tokenStore.set(null);
    setUser(null);
    qc.clear();
  }, [qc]);

  const updateProfile = useCallback(async (b: Record<string, unknown>) => {
    const u = await authService.patchMe(b);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(() => ({
    user, isAuthenticated: !!user, isInitializing, login, register, logout,
    refreshSession, reloadCurrentUser, updateProfile,
  }), [user, isInitializing, login, register, logout, reloadCurrentUser, updateProfile]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
