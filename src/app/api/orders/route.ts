import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { notifyUser } from "@/lib/notifications";

const createSchema = z.object({
  items: z.array(z.object({ produceId: z.string(), quantityKg: z.number().positive() })).min(1),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "ADMIN") {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { buyer: true, items: { include: { produce: true, farmer: true } } },
    });
    return NextResponse.json({ data: orders });
  }

  if (user.role === "BUYER" && user.buyerId) {
    const orders = await prisma.order.findMany({
      where: { buyerId: user.buyerId },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { produce: true, farmer: { include: { user: true } } } } },
    });
    return NextResponse.json({ data: orders });
  }

  if (user.role === "FARMER" && user.farmerId) {
    const orders = await prisma.order.findMany({
      where: { items: { some: { farmerId: user.farmerId } } },
      orderBy: { createdAt: "desc" },
      include: {
        buyer: true,
        items: { where: { farmerId: user.farmerId }, include: { produce: true } },
      },
    });
    return NextResponse.json({ data: orders });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const buyer = await prisma.buyer.findUnique({ where: { id: user.buyerId } });
    if (!buyer) return NextResponse.json({ error: "Buyer profile missing" }, { status: 400 });

    const lines: {
      produceId: string;
      farmerId: string;
      quantityKg: number;
      pricePerKg: number;
    }[] = [];

    let total = 0;
    for (const line of body.items) {
      const produce = await prisma.produce.findUnique({ where: { id: line.produceId } });
      if (!produce || !produce.isAvailable) {
        return NextResponse.json({ error: `Produce unavailable: ${line.produceId}` }, { status: 400 });
      }
      if (line.quantityKg < produce.minOrderKg) {
        return NextResponse.json({ error: `Below MOQ for ${produce.nameEn}` }, { status: 400 });
      }
      if (line.quantityKg > produce.quantityKg) {
        return NextResponse.json({ error: `Insufficient stock for ${produce.nameEn}` }, { status: 400 });
      }
      const lineTotal = line.quantityKg * produce.pricePerKg;
      total += lineTotal;
      lines.push({
        produceId: produce.id,
        farmerId: produce.farmerId,
        quantityKg: line.quantityKg,
        pricePerKg: produce.pricePerKg,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          buyerId: user.buyerId!,
          status: OrderStatus.PENDING,
          totalAmountETB: total,
          deliveryAddress: body.deliveryAddress ?? buyer.deliveryAddress ?? buyer.city,
          deliveryLat: buyer.deliveryLat,
          deliveryLng: buyer.deliveryLng,
          notes: body.notes,
          items: {
            create: lines.map((l) => ({
              produceId: l.produceId,
              farmerId: l.farmerId,
              quantityKg: l.quantityKg,
              pricePerKg: l.pricePerKg,
            })),
          },
        },
        include: { items: true },
      });
      return created;
    });

    const farmerIds = Array.from(new Set(lines.map((l) => l.farmerId)));
    for (const farmerId of farmerIds) {
      const farmer = await prisma.farmer.findUnique({
        where: { id: farmerId },
        select: { userId: true },
      });
      if (farmer) {
        await notifyUser({
          userId: farmer.userId,
          title: "New order on Gotera",
          body: "A buyer placed a new order including your produce.",
          href: `/farmer/orders/${order.id}`,
        });
      }
    }

    return NextResponse.json({ data: order });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.flatten() }, { status: 422 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
