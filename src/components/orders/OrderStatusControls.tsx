"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { OrderStatus } from "@prisma/client";

const farmerFlow: OrderStatus[] = ["CONFIRMED", "PREPARING", "DISPATCHED", "DELIVERED"];

export function OrderStatusControls({
  orderId,
  status,
  role,
}: {
  orderId: string;
  status: OrderStatus;
  role: "FARMER" | "BUYER" | "ADMIN";
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function patch(next: OrderStatus) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Update failed");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const Spinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2" style={{borderColor:'currentColor',borderTopColor:'transparent'}} />
  );

  if (role === "BUYER" && status === "PENDING") {
    return (
      <div className="space-y-2">
        {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
        <button type="button" className="btn-danger" disabled={loading} onClick={() => patch("CANCELLED")}>
          {loading ? <><Spinner />Processing...</> : "Cancel order"}
        </button>
      </div>
    );
  }

  if (role === "FARMER") {
    if (status === "PENDING") {
      return (
        <div className="flex flex-wrap gap-2">
          {error ? <p className="w-full text-xs text-[var(--gotera-red)]">{error}</p> : null}
          <button type="button" className="btn-primary" disabled={loading} onClick={() => patch("CONFIRMED")}>
            {loading ? <><Spinner />Processing...</> : "Accept & reserve stock"}
          </button>
          <button type="button" className="btn-secondary" disabled={loading} onClick={() => patch("CANCELLED")}>
            {loading ? <><Spinner />Processing...</> : "Decline"}
          </button>
        </div>
      );
    }

    const idx = farmerFlow.indexOf(status);
    const next = idx >= 0 && idx < farmerFlow.length - 1 ? farmerFlow[idx + 1] : null;
    if (!next) return null;

    return (
      <div className="space-y-2">
        {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
        <button type="button" className="btn-primary" disabled={loading} onClick={() => patch(next)}>
          {loading ? <><Spinner />Processing...</> : `Mark as ${next.toLowerCase()}`}
        </button>
      </div>
    );
  }

  if (role === "ADMIN") {
    return (
      <p className="text-xs text-[var(--gotera-earth)]">
        Admins can extend this panel to force status changes, attach invoices, or open disputes.
      </p>
    );
  }

  return null;
}
