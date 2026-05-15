"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { roleHomePath } from "@/lib/auth";
import type { Role } from "@prisma/client";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const [phone, setPhone] = useState("+251900001000");
  const [password, setPassword] = useState("gotera-demo-2026");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await signIn("credentials", {
      redirect: false,
      phone,
      password,
    });
    if (res?.error) {
      setError("Invalid phone or password");
      return;
    }

    if (callbackUrl) {
      router.push(callbackUrl);
      router.refresh();
      return;
    }

    const sessionRes = await fetch("/api/auth/session");
    const session = (await sessionRes.json()) as { user?: { role?: Role } };
    const role = session.user?.role;
    router.push(role ? roleHomePath(role) : "/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)]">
      {error ? <p className="text-sm text-[var(--gotera-red)]">{error}</p> : null}
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Phone
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Password
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <button className="btn-primary w-full justify-center" type="submit">
        Sign in
      </button>
      <p className="text-xs text-[var(--gotera-earth)]">
        Demo password: <span className="font-mono">gotera-demo-2026</span>. Try farmer <span className="font-mono">+251900001000</span>, buyer{" "}
        <span className="font-mono">+251911111000</span>, or admin <span className="font-mono">+251900009999</span>.
      </p>
      <Link href="/auth/register" className="block text-center text-sm font-semibold hover:underline">
        Create an account
      </Link>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--gotera-earth)]">Loading…</p>}>
      <LoginFormInner />
    </Suspense>
  );
}
