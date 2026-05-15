"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProduceActions({
  produceId,
  farmerId,
  nameEn,
  pricePerKg,
  minOrderKg,
  maxKg,
}: {
  produceId: string;
  farmerId: string;
  nameEn: string;
  pricePerKg: number;
  minOrderKg: number;
  maxKg: number;
}) {
  const router = useRouter();
  const [qty, setQty] = useState(minOrderKg);
  const [error, setError] = useState<string | null>(null);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  const Spinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2" style={{borderColor:'currentColor',borderTopColor:'transparent'}} />
  );

  function addToCart() {
    const raw = window.localStorage.getItem("gotera_cart");
    const cart = raw
      ? (JSON.parse(raw) as { produceId: string; nameEn: string; quantityKg: number; pricePerKg: number }[])
      : [];
    const idx = cart.findIndex((c) => c.produceId === produceId);
    const line = { produceId, nameEn, quantityKg: qty, pricePerKg };
    if (idx >= 0) cart[idx] = line;
    else cart.push(line);
    window.localStorage.setItem("gotera_cart", JSON.stringify(cart));
    router.push("/buyer/cart");
  }

  async function favorite() {
    setError(null);
    setLoadingFav(true);
    try {
      const res = await fetch("/api/buyer/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmerId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Could not save favorite");
      }
    } finally {
      setLoadingFav(false);
    }
  }

  async function buyNow() {
    setError(null);
    setLoadingBuy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ produceId, quantityKg: qty }] }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Order failed");
        return;
      }
      await favorite().catch(() => {});
      router.push("/buyer/orders");
      router.refresh();
    } finally {
      setLoadingBuy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Quantity (kg)
        <input
          type="number"
          min={minOrderKg}
          max={maxKg}
          step="0.1"
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2"
        />
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-secondary flex-1 justify-center" onClick={addToCart}>
          Add to cart
        </button>
        <button type="button" className="btn-primary flex-1 justify-center" disabled={loadingBuy} onClick={buyNow}>
          {loadingBuy ? <><Spinner />Processing...</> : "Buy now"}
        </button>
        <button type="button" className="btn-secondary flex-1 justify-center" disabled={loadingFav} onClick={favorite}>
          {loadingFav ? <><Spinner />Saving...</> : "Save farmer"}
        </button>
      </div>
      <p className="text-[11px] text-[var(--gotera-earth)]">Buying actions require an authenticated buyer session.</p>
    </div>
  );
}
