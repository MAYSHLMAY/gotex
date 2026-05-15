import type { OrderStatus } from "@prisma/client";

const styles: Record<OrderStatus, string> = {
  PENDING: "bg-[var(--gotera-mist)] text-[var(--gotera-bark)] ring-1 ring-[var(--gotera-earth)]/25",
  CONFIRMED: "bg-amber-100/80 text-amber-950 ring-1 ring-amber-300/40",
  PREPARING: "bg-[#fff3cd] text-[#664d03] ring-1 ring-[var(--gotera-gold)]/35",
  DISPATCHED: "bg-[var(--gotera-mist)] text-[var(--gotera-bark)] ring-1 ring-[var(--gotera-green)]/30",
  DELIVERED: "bg-[var(--gotera-green)]/15 text-[var(--gotera-green)] ring-1 ring-[var(--gotera-green)]/30",
  CANCELLED: "bg-[var(--gotera-red)]/12 text-[var(--gotera-red)] ring-1 ring-[var(--gotera-red)]/25",
};

type StatusBadgeProps = {
  status: OrderStatus;
  label?: string;
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {label ?? status.replace("_", " ")}
    </span>
  );
}
