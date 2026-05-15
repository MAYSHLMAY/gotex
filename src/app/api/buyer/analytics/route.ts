import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { buyerId: user.buyerId, status: { not: OrderStatus.CANCELLED } },
    include: { items: true },
  });

  const spend = orders
    .filter((o) => o.status === OrderStatus.DELIVERED)
    .reduce((sum, o) => sum + o.totalAmountETB, 0);

  const monthly = orders.filter((o) => o.createdAt >= new Date(Date.now() - 30 * 86400000)).length;

  return NextResponse.json({
    data: {
      spendETB: spend,
      ordersLast30d: monthly,
      openOrders: orders.filter((o) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED)
        .length,
    },
  });
}
