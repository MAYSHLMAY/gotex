import Link from "next/link";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function FarmerDashboardPage() {
  const session = await requireRoles("FARMER");
  const farmerId = session.user.farmerId!;

  const [produceCount, pendingOrders, lowStock] = await Promise.all([
    prisma.produce.count({ where: { farmerId } }),
    prisma.order.count({ where: { status: "PENDING", items: { some: { farmerId } } } }),
    prisma.produce.count({ where: { farmerId, quantityKg: { lt: 50 }, isAvailable: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Gotera storage</p>
        <h1 className="section-heading">ሰላም, {session.user.name}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--gotera-earth)]">
          Manage live inventory, incoming hotel and restaurant orders, and your cooperative visibility from one warm dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Listings</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-green)]">{produceCount}</p>
          <Link className="mt-3 inline-block text-sm font-semibold text-[var(--gotera-bark)] hover:underline" href="/farmer/inventory">
            Manage inventory →
          </Link>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Pending orders</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-amber)]">{pendingOrders}</p>
          <Link className="mt-3 inline-block text-sm font-semibold text-[var(--gotera-bark)] hover:underline" href="/farmer/orders">
            Review queue →
          </Link>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Low stock alerts</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-red)]">{lowStock}</p>
          <p className="mt-3 text-xs text-[var(--gotera-earth)]">Below 50 kg and still marked available.</p>
        </GoteraCard>
      </div>
    </div>
  );
}
