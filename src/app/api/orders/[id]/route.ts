import { NextResponse } from "next/server";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  notes: z.string().optional(),
});

type Params = { params: { id: string } };

async function loadAuthorizedOrder(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, buyer: true },
  });
  if (!order) return { order: null, reason: "not_found" as const };

  if (user.role === "ADMIN") return { order, reason: null };
  if (user.role === "BUYER" && user.buyerId === order.buyerId) return { order, reason: null };
  if (user.role === "FARMER" && user.farmerId && order.items.some((i) => i.farmerId === user.farmerId)) {
    return { order, reason: null };
  }

  return { order: null, reason: "forbidden" as const };
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order, reason } = await loadAuthorizedOrder(user, params.id);
  if (reason === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reason === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const full = await prisma.order.findUnique({
    where: { id: order!.id },
    include: {
      buyer: { include: { user: true } },
      items: { include: { produce: true, farmer: { include: { user: true } } } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
      invoice: true,
      review: true,
      disputes: true,
    },
  });

  return NextResponse.json({ data: full });
}

export async function PATCH(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { order, reason } = await loadAuthorizedOrder(user, params.id);
  if (reason === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reason === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await req.json());
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.flatten() }, { status: 422 });
    }
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const prev = order!.status;
  const nextStatus = body.status ?? prev;

  if (user.role === "BUYER" && body.status && body.status !== OrderStatus.CANCELLED) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (user.role === "BUYER" && body.status === OrderStatus.CANCELLED && prev !== OrderStatus.PENDING) {
    return NextResponse.json({ error: "Can only cancel pending orders" }, { status: 403 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (nextStatus === OrderStatus.CANCELLED && prev === OrderStatus.PENDING) {
        await tx.order.update({
          where: { id: order!.id },
          data: { status: nextStatus, notes: body.notes ?? order!.notes ?? undefined },
        });
        return;
      }

      if (nextStatus === OrderStatus.CONFIRMED && prev === OrderStatus.PENDING) {
        for (const item of order!.items) {
          const produce = await tx.produce.findUnique({ where: { id: item.produceId } });
          if (!produce) throw new Error("Missing produce");
          if (produce.quantityKg < item.quantityKg) throw new Error("Insufficient stock");
          await tx.produce.update({
            where: { id: produce.id },
            data: { quantityKg: produce.quantityKg - item.quantityKg },
          });
          await tx.orderItem.update({ where: { id: item.id }, data: { status: "CONFIRMED" } });
        }
      }

      if (nextStatus === OrderStatus.CANCELLED && prev === OrderStatus.CONFIRMED) {
        for (const item of order!.items) {
          const produce = await tx.produce.findUnique({ where: { id: item.produceId } });
          if (!produce) continue;
          await tx.produce.update({
            where: { id: produce.id },
            data: { quantityKg: produce.quantityKg + item.quantityKg },
          });
        }
      }

      await tx.order.update({
        where: { id: order!.id },
        data: {
          status: nextStatus,
          ...(body.notes !== undefined ? { notes: body.notes } : {}),
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Update failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const updated = await prisma.order.findUnique({ where: { id: order!.id }, include: { items: true } });
  return NextResponse.json({ data: updated });
}
