import type { ReactNode } from "react";
import { RoleShell, type RoleNavItem } from "@/components/layout/RoleShell";

const nav: RoleNavItem[] = [
  { href: "/farmer/dashboard", label: "Dashboard" },
  { href: "/farmer/inventory", label: "Inventory" },
  { href: "/farmer/orders", label: "Orders" },
  { href: "/farmer/analytics", label: "Analytics" },
  { href: "/farmer/calendar", label: "Harvest calendar" },
  { href: "/farmer/cooperative", label: "Cooperative" },
  { href: "/farmer/profile", label: "Profile" },
];

export default function FarmerLayout({ children }: { children: ReactNode }) {
  return <RoleShell title="Farmer console" nav={nav}>{children}</RoleShell>;
}
