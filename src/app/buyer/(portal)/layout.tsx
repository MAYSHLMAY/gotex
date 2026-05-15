import type { ReactNode } from "react";
import { RoleShell, type RoleNavItem } from "@/components/layout/RoleShell";

const nav: RoleNavItem[] = [
  { href: "/buyer/dashboard", label: "Dashboard" },
  { href: "/buyer/marketplace", label: "Marketplace" },
  { href: "/buyer/cart", label: "Cart" },
  { href: "/buyer/orders", label: "Orders" },
  { href: "/buyer/rfq", label: "RFQs" },
  { href: "/buyer/templates", label: "Templates" },
  { href: "/buyer/suppliers", label: "Suppliers" },
  { href: "/buyer/analytics", label: "Analytics" },
  { href: "/buyer/invoices", label: "Invoices" },
  { href: "/buyer/profile", label: "Profile" },
];

export default function BuyerPortalLayout({ children }: { children: ReactNode }) {
  return <RoleShell title="Buyer workspace" nav={nav}>{children}</RoleShell>;
}
