import Link from "next/link";
import { requireSession } from "@/lib/require-auth";
import { prisma } from "@/lib/prisma";
import { GoteraCard } from "@/components/ui/GoteraCard";

export default async function MessagesPage() {
  const session = await requireSession();

  let orders: { id: string; status: string; totalAmountETB: number }[] = [];

  if (session.user.role === "BUYER" && session.user.buyerId) {
    orders = await prisma.order.findMany({
      where: { buyerId: session.user.buyerId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, status: true, totalAmountETB: true },
    });
  } else if (session.user.role === "FARMER" && session.user.farmerId) {
    orders = await prisma.order.findMany({
      where: { items: { some: { farmerId: session.user.farmerId } } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, status: true, totalAmountETB: true },
    });
  } else if (session.user.role === "ADMIN") {
    orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, status: true, totalAmountETB: true },
    });
  }

  const base = session.user.role === "FARMER" ? "/farmer/orders" : session.user.role === "BUYER" ? "/buyer/orders" : "/admin/orders";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <p className="eyebrow">Gotera chat</p>
        <h1 className="section-heading">Conversations</h1>
        <p className="mt-2 text-sm text-[var(--gotera-earth)]">Messaging is scoped to each order — pick a thread below.</p>
      </div>
      <div className="grid gap-3">
        {orders.map((o) => (
          <GoteraCard key={o.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[var(--gotera-bark)]">Order #{o.id.slice(0, 8)}</p>
              <p className="text-xs text-[var(--gotera-earth)]">{o.status}</p>
            </div>
            <Link className="btn-secondary" href={`${base}/${o.id}`}>
              Open
            </Link>
          </GoteraCard>
        ))}
        {orders.length === 0 ? <GoteraCard>No conversations yet.</GoteraCard> : null}
      </div>
    </div>
  );
}
