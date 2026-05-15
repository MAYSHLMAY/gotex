"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Line = { produceId: string; nameEn: string; quantityKg: number; pricePerKg: number };

export default function BuyerCartPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("gotera_cart");
    if (!raw) return;
    try {
      setLines(JSON.parse(raw) as Line[]);
    } catch {
      setLines([]);
    }
  }, []);

  const total = useMemo(() => lines.reduce((sum, l) => sum + l.quantityKg * l.pricePerKg, 0), [lines]);

  async function checkout() {
    setError(null);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: lines.map((l) => ({ produceId: l.produceId, quantityKg: l.quantityKg })) }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Checkout failed");
      return;
    }
    window.localStorage.removeItem("gotera_cart");
    setLines([]);
    window.location.href = "/buyer/orders";
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Cart</p>
        <h1 className="section-heading">Bulk basket</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Items are stored locally until checkout creates a live order.</p>
      </div>
      {error ? <p className="text-sm text-[var(--gotera-red)]">{error}</p> : null}
      <div className="space-y-3">
        {lines.map((l) => (
          <div key={l.produceId} className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <p className="font-semibold text-[var(--gotera-bark)]">{l.nameEn}</p>
            <p className="text-xs text-[var(--gotera-earth)]">
              {l.quantityKg} kg @ {l.pricePerKg.toFixed(0)} ETB/kg
            </p>
          </div>
        ))}
        {lines.length === 0 ? <p className="text-sm text-[var(--gotera-earth)]">Your cart is empty.</p> : null}
      </div>
      {lines.length ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-accent text-2xl font-semibold text-[var(--gotera-green)]">{total.toFixed(0)} ETB</p>
          <button type="button" className="btn-primary" onClick={checkout}>
            Checkout
          </button>
        </div>
      ) : null}
      <Link href="/buyer/marketplace" className="btn-secondary inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
