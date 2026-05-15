import { notFound } from "next/navigation";
import Link from "next/link";
import { OrderChat } from "@/components/orders/OrderChat";
import { OrderStatusControls } from "@/components/orders/OrderStatusControls";
import { requireRoles } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Params = { params: { id: string } };

export default async function BuyerOrderDetailPage({ params }: Params) {
  const session = await requireRoles("BUYER");
  const buyerId = session.user.buyerId!;

  const order = await prisma.order.findFirst({
    where: { id: params.id, buyerId },
    include: {
      items: { include: { produce: true, farmer: { include: { user: true } } } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
      invoice: true,
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Tracking</p>
          <h1 className="section-heading">#{order.id.slice(0, 8)}</h1>
          <div className="mt-2">
            <StatusBadge status={order.status} />
          </div>
        </div>
        <OrderStatusControls orderId={order.id} status={order.status} role="BUYER" />
      </div>

      <GoteraCard>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Delivery</p>
        <p className="mt-2 text-sm text-[var(--gotera-bark)]">{order.deliveryAddress}</p>
        {order.invoice ? (
          <p className="mt-2 text-xs text-[var(--gotera-earth)]">Invoice recorded for {order.invoice.amountETB.toFixed(0)} ETB</p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`/buyer/orders/${order.id}/track`}
            className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: '#2d6a4f', color: '#fff' }}
          >
            Track Delivery
          </Link>
          <a
            href={`/api/orders/${order.id}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
            style={{ background: '#D4A017', color: '#1A1A2E' }}
          >
            Download Invoice PDF
          </a>
        </div>
      </GoteraCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--gotera-earth)]">Lines</p>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((i) => (
              <li key={i.id} className="border-b border-[var(--gotera-earth)]/10 pb-2">
                <div className="flex justify-between gap-3">
                  <span>{i.produce.nameEn}</span>
                  <span className="font-accent font-semibold">{i.quantityKg.toFixed(1)} kg</span>
                </div>
                <p className="text-xs text-[var(--gotera-earth)]">{i.farmer.user.nameEn}</p>
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
