import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const farmerId = user.farmerId;

  const items = await prisma.orderItem.findMany({
    where: { farmerId, order: { status: { not: OrderStatus.CANCELLED } } },
    include: { order: true, produce: true },
  });

  const revenue = items
    .filter((i) => i.order.status === OrderStatus.DELIVERED)
    .reduce((sum, i) => sum + i.quantityKg * i.pricePerKg, 0);

  const top = await prisma.orderItem.groupBy({
    by: ["produceId"],
    where: { farmerId, order: { status: OrderStatus.DELIVERED } },
    _sum: { quantityKg: true },
    orderBy: { _sum: { quantityKg: "desc" } },
    take: 5,
  });

  const produceNames = await prisma.produce.findMany({
    where: { id: { in: top.map((t) => t.produceId) } },
    select: { id: true, nameEn: true },
  });
  const map = new Map(produceNames.map((p) => [p.id, p.nameEn]));

  return NextResponse.json({
    data: {
      revenueETB: revenue,
      activeOrders: new Set(items.map((i) => i.orderId)).size,
      topProducts: top.map((t) => ({
        produceId: t.produceId,
        nameEn: map.get(t.produceId) ?? t.produceId,
        quantityKg: t._sum.quantityKg ?? 0,
      })),
    },
  });
}
