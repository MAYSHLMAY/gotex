import Link from "next/link";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { AIProcurementChat } from "@/components/buyer/AIProcurementChat";
import { SavingsWidget } from "@/components/buyer/SavingsWidget";

export default async function BuyerDashboardPage() {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const [openOrders, rfqs, templates, availableProduce] = await Promise.all([
    prisma.order.count({ where: { buyerId, status: { in: ["PENDING", "CONFIRMED", "PREPARING", "DISPATCHED"] } } }),
    prisma.rfq.count({ where: { buyerId, status: "OPEN" } }),
    prisma.procurementTemplate.count({ where: { buyerId } }),
    prisma.produce.findMany({ where: { isAvailable: true }, select: { nameEn: true }, distinct: ['nameEn'], take: 20 }),
  ]);

  const produceList = availableProduce.map(p => p.nameEn).join(', ');

  return (
    <div className="space-y-6">
      <SavingsWidget />
      
      <div>
        <p className="eyebrow">Procurement desk</p>
        <h1 className="section-heading">Welcome, {session.user.name}</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">
          Browse the public marketplace anytime — this secured desk tracks templates, RFQs, spend, and fulfillment.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Open orders</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-green)]">{openOrders}</p>
          <Link className="mt-3 inline-block text-sm font-semibold hover:underline" href="/buyer/orders">
            Track deliveries →
          </Link>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Open RFQs</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-amber)]">{rfqs}</p>
          <Link className="mt-3 inline-block text-sm font-semibold hover:underline" href="/buyer/rfq">
            Manage RFQs →
          </Link>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Templates</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-bark)]">{templates}</p>
          <Link className="mt-3 inline-block text-sm font-semibold hover:underline" href="/buyer/templates">
            Reorder faster →
          </Link>
        </GoteraCard>
      </div>
      
      <AIProcurementChat availableProduce={produceList} />
    </div>
  );
}
