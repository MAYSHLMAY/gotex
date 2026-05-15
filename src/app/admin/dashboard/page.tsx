import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function AdminDashboardPage() {
  await requireRoles("ADMIN");

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [farmers, buyers, ordersToday, gmv] = await Promise.all([
    prisma.farmer.count(),
    prisma.buyer.count(),
    prisma.order.count({ where: { createdAt: { gte: start } } }),
    prisma.order.aggregate({
      where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.DISPATCHED, OrderStatus.CONFIRMED] } },
      _sum: { totalAmountETB: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="section-heading">Platform pulse</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Farmers</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-green)]">{farmers}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Buyers</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-amber)]">{buyers}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Orders today</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-bark)]">{ordersToday}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">GMV (tracked)</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-green)]">
            {(gmv._sum.totalAmountETB ?? 0).toFixed(0)} ETB
          </p>
        </GoteraCard>
      </div>
    </div>
  );
}
