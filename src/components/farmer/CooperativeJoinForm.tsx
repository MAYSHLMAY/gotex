"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Coop = { id: string; name: string; region: string | null };

export function CooperativeJoinForm({ coops, cooperativeId }: { coops: Coop[]; cooperativeId: string | null }) {
  const router = useRouter();
  const [selected, setSelected] = useState(cooperativeId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    const res = await fetch("/api/farmer/cooperative", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cooperativeId: selected ? selected : null }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Cooperative
        <select
          className="mt-1 w-full rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2 text-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Independent (no cooperative)</option>
          {coops.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.region ? `· ${c.region}` : ""}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className="btn-primary" onClick={save}>
        Save membership
      </button>
      <p className="text-xs text-[var(--gotera-earth)]">
        Cooperative mode merges inventory for large buyers while tracking revenue splits in the ledger.
      </p>
    </div>
  );
}
