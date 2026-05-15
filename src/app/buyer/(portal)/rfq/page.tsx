import { CreateRfqForm } from "@/components/buyer/CreateRfqForm";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function BuyerRfqPage() {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const rows = await prisma.rfq.findMany({
    where: { buyerId },
    orderBy: { createdAt: "desc" },
    include: { bids: { include: { farmer: { include: { user: true } } } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">RFQs</p>
        <h1 className="section-heading">Request for quote</h1>
      </div>
      <CreateRfqForm />
      <div className="grid gap-4">
        {rows.map((r) => (
          <GoteraCard key={r.id}>
            <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">{r.produceType}</p>
            <p className="text-xs text-[var(--gotera-earth)]">
              {r.quantityKg} kg · {r.frequency} · closes {r.deadline.toDateString()} · {r.status}
            </p>
            <div className="mt-3 space-y-2 text-sm">
              {r.bids.map((b) => (
                <div key={b.id} className="rounded-lg bg-[var(--gotera-mist)]/60 px-3 py-2">
                  <p className="font-semibold text-[var(--gotera-bark)]">{b.farmer.user.nameEn}</p>
                  <p className="text-xs text-[var(--gotera-earth)]">
                    {b.quantityKg} kg @ {b.pricePerKg.toFixed(2)} ETB/kg
                  </p>
                </div>
              ))}
              {r.bids.length === 0 ? <p className="text-xs text-[var(--gotera-earth)]">Waiting for farmer bids.</p> : null}
            </div>
          </GoteraCard>
        ))}
      </div>
    </div>
  );
}
