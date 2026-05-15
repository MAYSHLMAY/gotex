"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";

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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
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

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Registration failed");
      return;
    }

    const sign = await signIn("credentials", { redirect: false, phone: base.phone, password: base.password });
    if (sign?.error) {
      router.push("/auth/login");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)]">
      {error ? <p className="text-sm text-[var(--gotera-red)]">{error}</p> : null}
      <div className="flex gap-2">
        <button type="button" className={role === "FARMER" ? "btn-primary" : "btn-secondary"} onClick={() => setRole("FARMER")}>
          Farmer
        </button>
        <button type="button" className={role === "BUYER" ? "btn-primary" : "btn-secondary"} onClick={() => setRole("BUYER")}>
          Buyer
        </button>
      </div>
      <input type="hidden" name="role" value={role} readOnly />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Full name (EN)
          <input name="nameEn" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-semibold">
          ስም (አማርኛ)
          <input name="nameAm" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Phone
          <input name="phone" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-semibold">
          Email (optional)
          <input name="email" type="email" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="text-sm font-semibold">
        Password
        <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>

      {role === "FARMER" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Region
            <input name="region" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            Woreda
            <input name="woreda" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            Farm size (sqm)
            <input name="farmSizeSqm" type="number" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            Farm types (comma)
            <input name="farmTypes" defaultValue="vegetables,fruits" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            Lat
            <input name="lat" type="number" step="0.000001" defaultValue="9.01" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            Lng
            <input name="lng" type="number" step="0.000001" defaultValue="38.76" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Business name
            <input name="businessName" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            License (optional)
            <input name="businessLicense" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            City
            <input name="city" defaultValue="Addis Ababa" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold">
            Business type
            <input name="businessType" defaultValue="restaurant" required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Delivery address
            <input name="deliveryAddress" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-semibold sm:col-span-2">
            Procurement frequency
            <select name="procurementFreq" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
            </select>
          </label>
        </div>
      )}

      <button className="btn-primary w-full justify-center" type="submit">
        Create account
      </button>
      <Link href="/auth/login" className="block text-center text-sm font-semibold hover:underline">
        Already registered? Log in
      </Link>
    </form>
  );
}

export function RegisterForm() {
  return (
    <Suspense fallback={<p className="text-sm text-[var(--gotera-earth)]">Loading…</p>}>
      <RegisterInner />
    </Suspense>
  );
}
