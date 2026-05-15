import Link from "next/link";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function FarmerOrdersPage() {
  const session = await requireRoles("FARMER");
  const farmerId = session.user.farmerId!;

  const orders = await prisma.order.findMany({
    where: { items: { some: { farmerId } } },
    orderBy: { createdAt: "desc" },
    include: { buyer: { include: { user: true } }, items: { where: { farmerId } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Orders</p>
        <h1 className="section-heading">Incoming procurement</h1>
      </div>
      <div className="grid gap-4">
        {orders.map((o) => (
          <GoteraCard key={o.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Order</p>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-2 font-display text-lg font-semibold text-[var(--gotera-bark)]">{o.buyer.businessName}</p>
              <p className="text-xs text-[var(--gotera-earth)]">{o.items.length} line items · {o.totalAmountETB.toFixed(0)} ETB</p>
            </div>
            <Link className="btn-secondary" href={`/farmer/orders/${o.id}`}>
              Open workspace
            </Link>
          </GoteraCard>
        ))}
        {orders.length === 0 ? <GoteraCard>No orders yet.</GoteraCard> : null}
      </div>
    </div>
  );
}
