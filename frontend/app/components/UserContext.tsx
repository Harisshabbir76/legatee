"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { API_URL } from "@/lib/api-client";
import { getCookie, clearToken, userAuthHeader, USER_COOKIE } from "@/lib/token";
import type { UserProfile } from "@/lib/api";

interface UserContextValue {
  user: UserProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  logoutAll: async () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const token = getCookie(USER_COOKIE);
      if (!token) { setUser(null); setLoading(false); return; }
      const res = await fetch(`${API_URL}/api/user/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = useCallback(async () => {
    const token = getCookie(USER_COOKIE);
    if (token) {
      fetch(`${API_URL}/api/user/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearToken(USER_COOKIE);
    setUser(null);
  }, []);

  const logoutAll = useCallback(async () => {
    const token = getCookie(USER_COOKIE);
    if (token) {
      fetch(`${API_URL}/api/user/auth/logout-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearToken(USER_COOKIE);
    setUser(null);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh, logout, logoutAll }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
