"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TemplateBuilderForm() {
  const router = useRouter();
  const [lines, setLines] = useState([{ nameEn: "Tomato", nameAm: "ቲማቲም", targetKg: 50 }]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const res = await fetch("/api/buyer/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, lines }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Failed");
      return;
    }
    setError(null);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {error ? <p className="text-xs text-[var(--gotera-red)]">{error}</p> : null}
      <input name="name" required placeholder="Template name" className="w-full rounded-lg border px-3 py-2 text-sm" />
      <div className="space-y-2">
        {lines.map((line, idx) => (
          <div key={idx} className="grid gap-2 sm:grid-cols-3">
            <input
              className="rounded-lg border px-2 py-2 text-sm"
              value={line.nameEn}
              onChange={(e) => {
                const next = [...lines];
                next[idx] = { ...line, nameEn: e.target.value };
                setLines(next);
              }}
            />
            <input
              className="rounded-lg border px-2 py-2 text-sm"
              value={line.nameAm ?? ""}
              onChange={(e) => {
                const next = [...lines];
                next[idx] = { ...line, nameAm: e.target.value };
                setLines(next);
              }}
            />
            <input
              type="number"
              className="rounded-lg border px-2 py-2 text-sm"
              value={line.targetKg}
              onChange={(e) => {
                const next = [...lines];
                next[idx] = { ...line, targetKg: Number(e.target.value) };
                setLines(next);
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setLines([...lines, { nameEn: "", nameAm: "", targetKg: 10 }])}
        >
          Add line
        </button>
        <button className="btn-primary" type="submit">
          Save template
        </button>
      </div>
    </form>
  );
}
