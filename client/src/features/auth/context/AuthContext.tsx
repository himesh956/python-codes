import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { AuthUser, LoginPayload, RegisterPayload } from "../types";
import { loginRequest, registerRequest, logoutRequest, refreshRequest } from "../api/auth.api";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Holds the access token in memory only (never localStorage — see
 * server-side rationale in auth.controller.ts). On first load, tries
 * a silent refresh using the httpOnly cookie so a page reload doesn't
 * force a re-login as long as the refresh token is still valid.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Attach the current access token to every outgoing request.
    const interceptorId = api.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptorId);
  }, [accessToken]);

  useEffect(() => {
    refreshRequest()
      .then((res) => {
        setUser(res.data.user);
        setAccessToken(res.data.accessToken);
      })
      .catch(() => {
        // No valid refresh cookie — user is simply logged out.
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(payload: LoginPayload) {
    const res = await loginRequest(payload);
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
    toast.success("Logged in successfully");
  }

  async function register(payload: RegisterPayload) {
    const res = await registerRequest(payload);
    setUser(res.data.user);
    setAccessToken(res.data.accessToken);
    toast.success("Account created successfully");
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}