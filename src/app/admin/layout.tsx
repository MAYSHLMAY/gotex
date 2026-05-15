import type { ReactNode } from "react";
import { RoleShell, type RoleNavItem } from "@/components/layout/RoleShell";

const nav: RoleNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RoleShell title="Gotera admin" nav={nav}>{children}</RoleShell>;
}
