"use client";

import { useState } from "react";

export function HarvestPlanForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const fd = new FormData(e.currentTarget);
    const payload = {
      nameEn: String(fd.get("nameEn") || ""),
      nameAm: String(fd.get("nameAm") || ""),
      quantityKg: Number(fd.get("quantityKg")),
      harvestDate: new Date(String(fd.get("harvestDate"))).toISOString(),
      notes: String(fd.get("notes") || "") || undefined,
    };
    
    const res = await fetch("/api/farmer/harvest-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed");
      setLoading(false);
      return;
    }
    
    e.currentTarget.reset();
    setError(null);
    setLoading(false);
    onSuccess?.(); // Call the refresh callback
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="nameEn" required placeholder="Crop (EN)" className="rounded-lg border border-[var(--gotera-earth)]/30 px-3 py-2 text-sm" />
        <input name="nameAm" placeholder="Crop (AM)" className="rounded-lg border border-[var(--gotera-earth)]/30 px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="quantityKg" type="number" required placeholder="Expected kg" className="rounded-lg border border-[var(--gotera-earth)]/30 px-3 py-2 text-sm" />
        <input name="harvestDate" type="datetime-local" required className="rounded-lg border border-[var(--gotera-earth)]/30 px-3 py-2 text-sm" />
      </div>
      <textarea name="notes" placeholder="Notes for buyers" className="w-full rounded-lg border border-[var(--gotera-earth)]/30 px-3 py-2 text-sm" />
      <button className="btn-primary w-full justify-center" type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save harvest window"}
      </button>
    </form>
  );
}