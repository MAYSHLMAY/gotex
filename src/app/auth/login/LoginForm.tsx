"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useCallback } from "react";
import { roleHomePath } from "@/lib/auth";
import type { Role } from "@prisma/client";

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const [phone, setPhone] = useState("+251900001000");
  const [password, setPassword] = useState("gotera-demo-2026");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        phone,
        password,
      });

      if (res?.error) {
        setError("Invalid phone or password");
        setIsLoading(false);
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
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }, [isLoading, phone, password, callbackUrl, router]);

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)]">
      {error && (
        <div className="animate-shake rounded-lg bg-[var(--gotera-red)]/10 px-4 py-3 text-sm text-[var(--gotera-red)]">
          {error}
        </div>
      )}
      
      <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
        Phone
        <input 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          disabled={isLoading}
          className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gotera-gold)] focus:ring-2 focus:ring-[var(--gotera-gold)]/20 disabled:opacity-50"
        />
      </label>
      
      <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
        Password
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          disabled={isLoading}
          className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gotera-gold)] focus:ring-2 focus:ring-[var(--gotera-gold)]/20 disabled:opacity-50"
        />
      </label>
      
      <button 
        className="btn-primary w-full justify-center" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Signing in...</span>
          </>
        ) : (
          "Sign in"
        )}
      </button>
      
      <p className="text-xs text-[var(--gotera-earth)]">
        Demo password: <span className="font-mono">gotera-demo-2026</span>. Try farmer <span className="font-mono">+251900001000</span>, buyer{" "}
        <span className="font-mono">+251911111000</span>, or admin <span className="font-mono">+251900009999</span>.
      </p>
      
      <Link href="/auth/register" className="block text-center text-sm font-semibold text-[var(--gotera-bark)] hover:text-[var(--gotera-green)] active:scale-[0.98] transition-all">
        Create an account
      </Link>
    </form>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)]">
        <div className="flex items-center justify-center py-8">
          <Spinner />
          <span className="ml-2 text-sm text-[var(--gotera-earth)]">Loading...</span>
        </div>
      </div>
    }>
      <LoginFormInner />
    </Suspense>
  );
}
