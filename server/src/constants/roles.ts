export const ROLES = {
  CANDIDATE: "CANDIDATE",
  EMPLOYER: "EMPLOYER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
