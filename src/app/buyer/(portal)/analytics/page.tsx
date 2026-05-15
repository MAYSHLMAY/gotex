import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { PriceChart } from "@/components/buyer/PriceChart";
import { SavingsWidget } from "@/components/buyer/SavingsWidget";

export default async function BuyerAnalyticsPage() {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const orders = await prisma.order.findMany({ where: { buyerId } });
  const spend = orders
    .filter((o) => o.status === OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.totalAmountETB, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Analytics</p>
        <h1 className="section-heading">Spend & price intelligence</h1>
      </div>
      
      <SavingsWidget />
      
      <GoteraCard>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Delivered spend</p>
        <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-green)]">{spend.toFixed(0)} ETB</p>
      </GoteraCard>
      
      <PriceChart />
    </div>
  );
}
