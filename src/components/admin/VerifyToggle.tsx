"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function VerifyToggle({ userId, verified }: { userId: string; verified: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, verified: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button type="button" className={verified ? "btn-secondary" : "btn-primary"} disabled={loading} onClick={() => toggle(!verified)}>
      {verified ? "Revoke" : "Verify"}
    </button>
  );
}
