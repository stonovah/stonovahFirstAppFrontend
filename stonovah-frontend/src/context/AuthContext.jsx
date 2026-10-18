// src/context/AuthContext.jsx — replaces the earlier version (no longer rejects admins)
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { setAccessToken, setAuthFailureHandler } from '../api/apiClient';
import { authApi } from '../api/organizer';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // /me payload (organizerProfile is null for admins)
  const [status, setStatus] = useState('loading'); // 'loading' | 'authed' | 'guest'

  const clear = useCallback(() => { setAccessToken(null); setUser(null); setStatus('guest'); }, []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
    setStatus('authed');
    return me;
  }, []);

  // Boot: refresh cookie -> access token -> /me
  useEffect(() => {
    setAuthFailureHandler(clear);
    (async () => {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        await refreshUser();
      } catch {
        clear(); // any failure here means "logged out"
      }
    })();
  }, [clear, refreshUser]);

  // Works for both ORGANIZER and ADMIN; the caller redirects by role
  const login = async (email, password) => {
    const { accessToken } = await authApi.login(email.trim().toLowerCase(), password);
    setAccessToken(accessToken);
    return refreshUser();
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    clear();
  };

  return <AuthCtx.Provider value={{ user, status, login, logout, refreshUser }}>{children}</AuthCtx.Provider>;
}

// src/context/AuthContext.jsx: add at the bottom
export const useCan = () => {
  const { user } = useAuth();
  const perms = user?.access?.permissions || [];
  return (perm) => perms.includes(perm);
};

export function Can({ perm, fallback = null, children }) {
  const can = useCan();
  return can(perm) ? children : fallback;
}