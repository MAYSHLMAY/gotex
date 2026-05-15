"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateRfqForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      produceType: String(fd.get("produceType")),
      quantityKg: Number(fd.get("quantityKg")),
      frequency: String(fd.get("frequency")),
      durationDays: Number(fd.get("durationDays")),
      deadline: new Date(String(fd.get("deadline"))).toISOString(),
    };
    const res = await fetch("/api/rfqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed");
      return;
    }
    e.currentTarget.reset();
    setError(null);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
      <input name="produceType" required placeholder="Produce family (e.g. Potatoes)" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="quantityKg" type="number" required placeholder="Kg per cycle" className="rounded-lg border px-3 py-2 text-sm" />
        <input name="frequency" required placeholder="weekly / daily" className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="durationDays" type="number" required placeholder="Duration (days)" className="rounded-lg border px-3 py-2 text-sm" />
        <input name="deadline" type="datetime-local" required className="rounded-lg border px-3 py-2 text-sm" />
      </div>
      <button className="btn-primary w-full justify-center" type="submit">
        Publish RFQ
      </button>
    </form>
  );
}
