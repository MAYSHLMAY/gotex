"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DisputeRow({ dispute }: { dispute: { id: string; reason: string; status: string; orderId: string } }) {
  const router = useRouter();
  const [resolution, setResolution] = useState("");

  async function resolve() {
    await fetch("/api/admin/disputes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: dispute.id, status: "RESOLVED", resolution }),
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="font-semibold text-[var(--gotera-bark)]">Order #{dispute.orderId.slice(0, 8)}</p>
        <p className="text-xs text-[var(--gotera-earth)]">{dispute.status}</p>
        <p className="mt-2 text-sm">{dispute.reason}</p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-72">
        <textarea value={resolution} onChange={(e) => setResolution(e.target.value)} className="rounded-lg border px-3 py-2 text-sm" placeholder="Resolution notes" />
        <button type="button" className="btn-primary justify-center" onClick={resolve}>
          Resolve
        </button>
      </div>
    </div>
  );
}
