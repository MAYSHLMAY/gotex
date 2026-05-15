"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  sender: { nameEn: string; role: string };
};

export function OrderChat({ orderId, initial }: { orderId: string; initial: Message[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setError(null);
    const res = await fetch(`/api/orders/${orderId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed to send");
      return;
    }
    setText("");
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Gotera chat</p>
      <div className="max-h-72 space-y-2 overflow-y-auto text-sm">
        {initial.map((m) => (
          <div key={m.id} className="rounded-lg bg-[var(--gotera-mist)]/60 px-3 py-2">
            <p className="text-xs font-semibold text-[var(--gotera-bark)]">
              {m.sender.nameEn} · {m.sender.role}
            </p>
            <p className="mt-1 text-[var(--gotera-charcoal)]">{m.content}</p>
          </div>
        ))}
        {initial.length === 0 ? <p className="text-xs text-[var(--gotera-earth)]">No messages yet.</p> : null}
      </div>
      {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[72px] flex-1 rounded-lg border border-[var(--gotera-earth)]/30 bg-white px-3 py-2 text-sm"
          placeholder="Type in Amharic or English…"
        />
        <button type="button" className="btn-primary self-end" onClick={send} disabled={!text.trim()}>
          Send
        </button>
      </div>
      <p className="text-[11px] text-[var(--gotera-earth)]">Voice notes and auto-translate can plug into this composer later.</p>
    </div>
  );
}
