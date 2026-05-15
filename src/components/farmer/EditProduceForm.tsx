"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Produce = {
  id: string;
  nameEn: string;
  nameAm: string;
  category: string;
  quantityKg: number;
  pricePerKg: number;
  minOrderKg: number;
  grade: string;
  harvestDate: string;
  freshnessWindow: number;
  imageUrls: string[];
  deliveryOffered: boolean;
  deliveryRadiusKm: number | null;
  isAvailable: boolean;
};

export function EditProduceForm({ produce }: { produce: Produce }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const defaults = useMemo(() => {
    const d = new Date(produce.harvestDate);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    return { harvestLocal: local, imageUrl: produce.imageUrls.join(", ") };
  }, [produce]);

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
      isAvailable: fd.get("isAvailable") === "on",
      deliveryOffered: fd.get("deliveryOffered") === "on",
      deliveryRadiusKm: fd.get("deliveryOffered") === "on" ? Number(fd.get("deliveryRadiusKm") || 20) : null,
    };

    const res = await fetch(`/api/farmer/produce/${produce.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed to update");
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
          <input name="nameEn" required defaultValue={produce.nameEn} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          አማርኛ ስም
          <input name="nameAm" required defaultValue={produce.nameAm} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
      </div>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Category
        <input name="category" required defaultValue={produce.category} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Stock (kg)
          <input name="quantityKg" type="number" step="0.01" required defaultValue={produce.quantityKg} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Price / kg (ETB)
          <input name="pricePerKg" type="number" step="0.01" required defaultValue={produce.pricePerKg} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          MOQ (kg)
          <input name="minOrderKg" type="number" step="0.01" required defaultValue={produce.minOrderKg} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Grade
          <select name="grade" defaultValue={produce.grade} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2">
            <option>A</option>
            <option>B</option>
            <option>C</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-[var(--gotera-bark)]">
          Freshness window (days)
          <input name="freshnessWindow" type="number" defaultValue={produce.freshnessWindow} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
        </label>
      </div>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Harvest date
        <input name="harvestDate" type="datetime-local" required defaultValue={defaults.harvestLocal} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
      </label>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Image URLs (comma separated)
        <input name="imageUrl" defaultValue={defaults.imageUrl} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--gotera-bark)]">
        <input name="isAvailable" type="checkbox" defaultChecked={produce.isAvailable} />
        Available on marketplace
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--gotera-bark)]">
        <input name="deliveryOffered" type="checkbox" defaultChecked={produce.deliveryOffered} />
        Delivery offered
      </label>
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Delivery radius (km)
        <input name="deliveryRadiusKm" type="number" defaultValue={produce.deliveryRadiusKm ?? 25} className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2" />
      </label>
      <button className="btn-primary w-full justify-center" type="submit" disabled={loading}>
        {loading ? "Saving…" : "Update listing"}
      </button>
    </form>
  );
}
