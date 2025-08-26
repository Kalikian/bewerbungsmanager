"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getAccount, login as apiLogin } from "../services/userApi";
import { clearToken, getToken } from "@lib/http";
import type { UserDB } from "@shared";

type UserProfile = Omit<UserDB, "password">;

type AuthContextValue = {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getAccount();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check user profile on first load
    refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin({ email, password }); // login and store token
    const me = await getAccount(); // get user profile
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value: AuthContextValue = { user, loading, login, logout, refreshMe };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
