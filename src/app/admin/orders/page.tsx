import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function AdminOrdersPage() {
  await requireRoles("ADMIN");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { buyer: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Orders</p>
        <h1 className="section-heading">Fulfillment oversight</h1>
      </div>
      <div className="grid gap-3">
        {orders.map((o) => (
          <GoteraCard key={o.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">#{o.id.slice(0, 8)}</p>
                <StatusBadge status={o.status} />
              </div>
              <p className="text-sm text-[var(--gotera-earth)]">{o.buyer.businessName}</p>
            </div>
            <p className="font-accent text-xl font-semibold text-[var(--gotera-green)]">{o.totalAmountETB.toFixed(0)} ETB</p>
          </GoteraCard>
        ))}
      </div>
    </div>
  );
}
