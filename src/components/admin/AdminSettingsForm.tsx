"use client";

import { useEffect, useState } from "react";

export function AdminSettingsForm() {
  const [commission, setCommission] = useState("0.04");
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.data?.commission_rate) setCommission(String(j.data.commission_rate));
      })
      .catch(() => {});
  }, []);

  async function save() {
    setStatus(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commission_rate: commission }),
    });
    setStatus(res.ok ? "Saved" : "Failed");
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      <label className="text-sm font-semibold text-[var(--gotera-bark)]">
        Commission rate (decimal)
        <input value={commission} onChange={(e) => setCommission(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
      </label>
      <button type="button" className="btn-primary" onClick={save}>
        Save platform settings
      </button>
      {status ? <p className="text-xs text-[var(--gotera-earth)]">{status}</p> : null}
    </div>
  );
}
