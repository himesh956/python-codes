import { api } from "@/lib/api";
import { AuthResponse, LoginPayload, RegisterPayload } from "../types";

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", payload);
  return res.data;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/register", payload);
  return res.data;
}

export async function refreshRequest(): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/refresh");
  return res.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post("/auth/logout");
}

export async function meRequest() {
  const res = await api.get("/auth/me");
  return res.data;
}