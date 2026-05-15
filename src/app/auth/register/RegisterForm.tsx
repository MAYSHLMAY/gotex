"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense, useCallback } from "react";

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function RegisterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = useMemo(() => {
    const r = searchParams.get("role");
    if (r === "farmer") return "FARMER" as const;
    if (r === "buyer") return "BUYER" as const;
    return "FARMER" as const;
  }, [searchParams]);

  const [role, setRole] = useState<"FARMER" | "BUYER">(initialRole);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    setError(null);
    setIsLoading(true);
    
    const fd = new FormData(e.currentTarget);

    const base = {
      role,
      nameEn: String(fd.get("nameEn")),
      nameAm: String(fd.get("nameAm") || ""),
      phone: String(fd.get("phone")),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password")),
    };

    const payload =
      role === "FARMER"
        ? {
            ...base,
            region: String(fd.get("region")),
            woreda: String(fd.get("woreda")),
            farmSizeSqm: Number(fd.get("farmSizeSqm")),
            farmTypes: String(fd.get("farmTypes"))
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            lat: Number(fd.get("lat")),
            lng: Number(fd.get("lng")),
          }
        : {
            ...base,
            businessName: String(fd.get("businessName")),
            businessLicense: String(fd.get("businessLicense") || ""),
            city: String(fd.get("city")),
            businessType: String(fd.get("businessType")),
            deliveryAddress: String(fd.get("deliveryAddress") || ""),
            procurementFreq: String(fd.get("procurementFreq") || "") || undefined,
          };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      const sign = await signIn("credentials", { redirect: false, phone: base.phone, password: base.password });
      if (sign?.error) {
        router.push("/auth/login");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }, [isLoading, role, router]);

  const inputClass = "mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/20 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-[var(--gotera-gold)] focus:ring-2 focus:ring-[var(--gotera-gold)]/20 disabled:opacity-50";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)]">
      {error && (
        <div className="animate-shake rounded-lg bg-[var(--gotera-red)]/10 px-4 py-3 text-sm text-[var(--gotera-red)]">
          {error}
        </div>
      )}
      
      <div className="flex gap-2">
        <button 
          type="button" 
          disabled={isLoading}
          className={role === "FARMER" ? "btn-primary flex-1" : "btn-secondary flex-1"} 
          onClick={() => setRole("FARMER")}
        >
          Farmer
        </button>
        <button 
          type="button" 
          disabled={isLoading}
          className={role === "BUYER" ? "btn-primary flex-1" : "btn-secondary flex-1"} 
          onClick={() => setRole("BUYER")}
        >
          Buyer
        </button>
      </div>
      
      <input type="hidden" name="role" value={role} readOnly />
      
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
          Full name (EN)
          <input name="nameEn" required disabled={isLoading} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
          {"ስም (አማርኛ)"}
          <input name="nameAm" disabled={isLoading} className={inputClass} />
        </label>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
          Phone
          <input name="phone" required disabled={isLoading} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
          Email (optional)
          <input name="email" type="email" disabled={isLoading} className={inputClass} />
        </label>
      </div>
      
      <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
        Password
        <input name="password" type="password" required minLength={8} disabled={isLoading} className={inputClass} />
      </label>

      {role === "FARMER" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Region
            <input name="region" required disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Woreda
            <input name="woreda" required disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Farm size (sqm)
            <input name="farmSizeSqm" type="number" required disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Farm types (comma)
            <input name="farmTypes" defaultValue="vegetables,fruits" disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Lat
            <input name="lat" type="number" step="0.000001" defaultValue="9.01" disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Lng
            <input name="lng" type="number" step="0.000001" defaultValue="38.76" disabled={isLoading} className={inputClass} />
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Business name
            <input name="businessName" required disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            License (optional)
            <input name="businessLicense" disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            City
            <input name="city" defaultValue="Addis Ababa" required disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)]">
            Business type
            <input name="businessType" defaultValue="restaurant" required disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)] sm:col-span-2">
            Delivery address
            <input name="deliveryAddress" disabled={isLoading} className={inputClass} />
          </label>
          <label className="block text-sm font-semibold text-[var(--gotera-bark)] sm:col-span-2">
            Procurement frequency
            <select name="procurementFreq" disabled={isLoading} className={inputClass}>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
            </select>
          </label>
        </div>
      )}

      <button 
        className="btn-primary w-full justify-center" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>Creating account...</span>
          </>
        ) : (
          "Create account"
        )}
      </button>
      
      <Link href="/auth/login" className="block text-center text-sm font-semibold text-[var(--gotera-bark)] hover:text-[var(--gotera-green)] active:scale-[0.98] transition-all">
        Already registered? Log in
      </Link>
    </form>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-2xl rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)]">
        <div className="flex items-center justify-center py-8">
          <Spinner />
          <span className="ml-2 text-sm text-[var(--gotera-earth)]">Loading...</span>
        </div>
      </div>
    }>
      <RegisterInner />
    </Suspense>
  );
}
