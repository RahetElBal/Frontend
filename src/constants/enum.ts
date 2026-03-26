// User
export const AppRole = {
  USER: "user",
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
} as const;

export type AppRole = (typeof AppRole)[keyof typeof AppRole];
