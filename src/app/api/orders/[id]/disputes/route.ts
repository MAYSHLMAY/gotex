import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const disputeSchema = z.object({
  reason: z.string().min(4).max(2000),
});

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: params.id }, include: { buyer: true, items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isBuyer = user.role === "BUYER" && user.buyerId === order.buyerId;
  const isFarmer =
    user.role === "FARMER" && user.farmerId && order.items.some((i) => i.farmerId === user.farmerId);
  if (!isBuyer && !isFarmer) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = disputeSchema.parse(await req.json());
  const dispute = await prisma.dispute.create({
    data: {
      orderId: order.id,
      openedById: user.id,
      reason: body.reason,
    },
  });

  return NextResponse.json({ data: dispute });
}
