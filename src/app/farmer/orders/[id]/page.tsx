import { notFound } from "next/navigation";
import { OrderChat } from "@/components/orders/OrderChat";
import { OrderStatusControls } from "@/components/orders/OrderStatusControls";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Params = { params: { id: string } };

export default async function FarmerOrderDetailPage({ params }: Params) {
  const session = await requireRoles("FARMER");
  const farmerId = session.user.farmerId!;

  const order = await prisma.order.findFirst({
    where: { id: params.id, items: { some: { farmerId } } },
    include: {
      buyer: true,
      items: { where: { farmerId }, include: { produce: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Order workspace</p>
          <h1 className="section-heading">#{order.id.slice(0, 8)}</h1>
          <div className="mt-2">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <OrderStatusControls orderId={order.id} status={order.status} role="FARMER" />
      </div>

      <GoteraCard>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Buyer</p>
        <p className="mt-2 font-display text-xl font-semibold text-[var(--gotera-bark)]">{order.buyer.businessName}</p>
        <p className="mt-1 text-sm text-[var(--gotera-earth)]">{order.deliveryAddress}</p>
        {order.status === 'DELIVERED' && (
          <a
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: '#D4A017', color: '#1A1A2E' }}
          >
            Download Invoice PDF
          </a>
        )}
      </GoteraCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Your lines</p>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="flex justify-between gap-3 border-b border-[var(--gotera-earth)]/10 pb-2">
                <span>{i.produce.nameEn}</span>
                <span className="font-accent font-semibold">
                  {i.quantityKg.toFixed(1)} kg @ {i.pricePerKg.toFixed(0)} ETB
                </span>
              </li>
            ))}
          </ul>
        </GoteraCard>
        <OrderChat
          orderId={order.id}
          initial={order.messages.map((m) => ({
            id: m.id,
            content: m.content,
            createdAt: m.createdAt.toISOString(),
            sender: { nameEn: m.sender.nameEn, role: m.sender.role },
          }))}
        />
      </div>
    </div>
  );
}
