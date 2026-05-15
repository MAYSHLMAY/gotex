import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function AdminAnalyticsPage() {
  await requireRoles("ADMIN");

  const produce = await prisma.produce.count({ where: { isAvailable: true } });
  const orders = await prisma.order.count();

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Analytics</p>
        <h1 className="section-heading">Availability & throughput</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Live SKUs</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-green)]">{produce}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">All orders</p>
          <p className="mt-2 font-accent text-3xl font-semibold text-[var(--gotera-amber)]">{orders}</p>
        </GoteraCard>
      </div>
    </div>
  );
}
