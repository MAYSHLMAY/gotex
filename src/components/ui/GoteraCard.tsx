import type { ReactNode } from "react";

type GoteraCardProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "section";
};

/**
 * Coffee-ceremony card: cream surface, gold left rail, warm shadow, subtle tilet watermark.
 */
export function GoteraCard({ children, className = "", as: Tag = "div" }: GoteraCardProps) {
  return (
    <Tag
      className={`relative overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-warm)] ${className}`}
    >
      <span
        className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-[var(--gotera-gold)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M24 2 L44 24 L24 46 L4 24 Z' fill='none' stroke='%235C3317' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative pl-4">{children}</div>
    </Tag>
  );
}
