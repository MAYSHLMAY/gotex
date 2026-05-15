import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [farmers, buyers, ordersToday, gmvAgg, topProduce] = await Promise.all([
    prisma.farmer.count(),
    prisma.buyer.count(),
    prisma.order.count({
      where: { createdAt: { gte: start } },
    }),
    prisma.order.aggregate({
      where: { status: { in: [OrderStatus.DELIVERED, OrderStatus.DISPATCHED, OrderStatus.CONFIRMED] } },
      _sum: { totalAmountETB: true },
    }),
    prisma.orderItem.groupBy({
      by: ["produceId"],
      _sum: { quantityKg: true },
      orderBy: { _sum: { quantityKg: "desc" } },
      take: 5,
    }),
  ]);

  const produceMeta = await prisma.produce.findMany({
    where: { id: { in: topProduce.map((p) => p.produceId) } },
    select: { id: true, nameEn: true },
  });
  const nameById = new Map(produceMeta.map((p) => [p.id, p.nameEn]));

  return NextResponse.json({
    data: {
      farmers,
      buyers,
      ordersToday,
      gmvETB: gmvAgg._sum.totalAmountETB ?? 0,
      topProduce: topProduce.map((p) => ({
        produceId: p.produceId,
        nameEn: nameById.get(p.produceId) ?? p.produceId,
        quantityKg: p._sum.quantityKg ?? 0,
      })),
    },
  });
}
