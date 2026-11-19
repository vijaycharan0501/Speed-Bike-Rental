import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { adminApi } from '../services/api';

const AuthContext = createContext({
  admin: null,
  checkingAuth: true,
  login: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await adminApi.me();
      setAdmin(res.data?.admin || null);
    } catch {
      setAdmin(null);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (email, password) => {
    const res = await adminApi.login({ email, password });
    setAdmin(res.data?.admin || null);
    return res.data?.admin;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } finally {
      setAdmin(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ admin, checkingAuth, login, logout, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
