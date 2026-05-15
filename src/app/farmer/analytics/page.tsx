import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { PriceChart } from "@/components/buyer/PriceChart";

export default async function FarmerAnalyticsPage() {
  const session = await requireRoles("FARMER");
  const farmerId = session.user.farmerId!;

  const items = await prisma.orderItem.findMany({
    where: { farmerId, order: { status: { not: OrderStatus.CANCELLED } } },
    include: { order: true },
  });

  const revenue = items
    .filter((i) => i.order.status === OrderStatus.DELIVERED)
    .reduce((sum, i) => sum + i.quantityKg * i.pricePerKg, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Analytics</p>
        <h1 className="section-heading">Performance snapshot</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Delivered revenue</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-green)]">{revenue.toFixed(0)} ETB</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Active order lines</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-amber)]">{items.length}</p>
        </GoteraCard>
      </div>
      
      <PriceChart />
      
      <GoteraCard>
        <p className="text-sm text-[var(--gotera-earth)]">
          Use the market pulse above to compare your prices against Atikilt Tera and optimize your listings.
        </p>
      </GoteraCard>
    </div>
  );
}
