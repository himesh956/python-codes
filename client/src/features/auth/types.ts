export type Role = "CANDIDATE" | "EMPLOYER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: "CANDIDATE" | "EMPLOYER";
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
}