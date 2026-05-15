/**
 * NextAuth.js wiring lands in Phase 1.
 * Export shared role checks and session types here as the app grows.
 */
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
  nameEn: string;
  phone: string;
};

export function roleHomePath(role: Role): string {
  switch (role) {
    case "FARMER":
      return "/farmer/dashboard";
    case "BUYER":
      return "/buyer/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    default:
      return "/";
  }
}
