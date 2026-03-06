import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ginga_token');
    if (!token) { setLoading(false); return; }
    api('/api/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('ginga_token'))
      .finally(() => setLoading(false));

    // Clean up ?upgraded=true from Stripe redirect
    if (window.location.search.includes('upgraded=true')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('ginga_token', data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    localStorage.setItem('ginga_token', data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ginga_token');
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await api('/api/auth/me');
    setUser(data);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
