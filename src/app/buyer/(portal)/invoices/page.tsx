import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function BuyerInvoicesPage() {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const invoices = await prisma.invoice.findMany({
    where: { order: { buyerId } },
    orderBy: { createdAt: "desc" },
    include: { order: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Invoices</p>
        <h1 className="section-heading">Finance-ready exports</h1>
      </div>
      <div className="grid gap-3">
        {invoices.map((inv) => (
          <GoteraCard key={inv.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-semibold text-[var(--gotera-bark)]">Order #{inv.orderId.slice(0, 8)}</p>
              <p className="text-xs text-[var(--gotera-earth)]">Issued {inv.createdAt.toDateString()}</p>
            </div>
            <p className="font-accent text-2xl font-semibold text-[var(--gotera-green)]">{inv.amountETB.toFixed(0)} ETB</p>
          </GoteraCard>
        ))}
        {invoices.length === 0 ? <GoteraCard>No invoices yet — generate from a delivered order.</GoteraCard> : null}
      </div>
    </div>
  );
}
