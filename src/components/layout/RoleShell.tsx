"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type RoleNavItem = { href: string; label: string };

export function RoleShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: RoleNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-24 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 shadow-[var(--shadow-warm)]">
            <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{title}</p>
            <nav className="mt-4 space-y-1" aria-label="Primary">
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[var(--gotera-mist)] text-[var(--gotera-bark)] ring-1 ring-[var(--gotera-earth)]/20"
                        : "text-[var(--gotera-earth)] hover:bg-[var(--gotera-mist)]/60"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <Link href="/" className="mt-6 block text-xs font-semibold text-[var(--gotera-earth)] hover:underline">
              ← Back to marketing site
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 md:pb-8">{children}</div>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--gotera-earth)]/15 bg-[var(--gotera-cream)]/95 backdrop-blur md:hidden"
        aria-label="Mobile primary"
      >
        <div className="mx-auto flex max-w-6xl justify-around px-2 py-2">
          {nav.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-[64px] flex-col items-center rounded-md px-2 py-1 text-[11px] font-semibold ${
                  active ? "text-[var(--gotera-bark)]" : "text-[var(--gotera-earth)]"
                }`}
              >
                <span className="font-mono text-[9px] uppercase tracking-wide">{item.label.split(" ")[0]}</span>
                <span className="text-center leading-tight">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
