import Link from "next/link";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function BuyerOrdersPage() {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const orders = await prisma.order.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { farmer: { include: { user: true } } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Orders</p>
        <h1 className="section-heading">Procurement timeline</h1>
      </div>
      <div className="grid gap-4">
        {orders.map((o) => (
          <GoteraCard key={o.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Order</p>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-2 text-sm text-[var(--gotera-earth)]">{o.items.length} farmers · {o.totalAmountETB.toFixed(0)} ETB</p>
            </div>
            <Link className="btn-secondary" href={`/buyer/orders/${o.id}`}>
              Track & chat
            </Link>
          </GoteraCard>
        ))}
        {orders.length === 0 ? <GoteraCard>No orders yet — start from the marketplace.</GoteraCard> : null}
      </div>
    </div>
  );
}
