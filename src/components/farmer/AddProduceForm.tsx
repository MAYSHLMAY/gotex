"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AddProduceForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      nameEn: String(fd.get("nameEn") || ""),
      nameAm: String(fd.get("nameAm") || ""),
      category: String(fd.get("category") || ""),
      quantityKg: Number(fd.get("quantityKg")),
      pricePerKg: Number(fd.get("pricePerKg")),
      minOrderKg: Number(fd.get("minOrderKg")),
      grade: String(fd.get("grade") || "A"),
      harvestDate: new Date(String(fd.get("harvestDate") || new Date().toISOString())).toISOString(),
      freshnessWindow: Number(fd.get("freshnessWindow") || 5),
      imageUrls: String(fd.get("imageUrl") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      deliveryOffered: fd.get("deliveryOffered") === "on",
      deliveryRadiusKm: fd.get("deliveryOffered") === "on" ? Number(fd.get("deliveryRadiusKm") || 20) : null,
    };

    const res = await fetch("/api/farmer/produce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed to save");
      return;
    }
    router.push("/farmer/inventory");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)]">
      {error ? <p className="text-sm text-[var(--gotera-red)]">{error}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          English name
          <input name="nameEn" required className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          አማርኛ ስም
          <input name="nameAm" required className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
      </div>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Category
        <input name="category" required placeholder="vegetables" className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Stock (kg)
          <input name="quantityKg" type="number" step="0.01" required className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Price / kg (ETB)
          <input name="pricePerKg" type="number" step="0.01" required className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          MOQ (kg)
          <input name="minOrderKg" type="number" step="0.01" required className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Grade
          <select name="grade" className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2">
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Freshness window (days)
          <input name="freshnessWindow" type="number" defaultValue={5} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
      </div>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Harvest date
        <input name="harvestDate" type="datetime-local" required className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
      </label>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Image URLs (comma separated)
        <input
          name="imageUrl"
          defaultValue="https://images.unsplash.com/photo-1546094096-0df4bcaaa508?auto=format&fit=crop&w=800&q=60"
          className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--gotera-bark)]">
        <input name="deliveryOffered" type="checkbox" />
        Delivery offered
      </label>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Delivery radius (km)
        <input name="deliveryRadiusKm" type="number" defaultValue={25} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
      </label>
      <button className="btn-primary w-full justify-center" type="submit" disabled={loading}>
        {loading ? "Saving…" : "Publish listing"}
      </button>
    </form>
  );
}
