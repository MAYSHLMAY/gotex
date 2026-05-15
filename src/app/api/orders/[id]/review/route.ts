import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true, review: true },
  });
  if (!order || order.buyerId !== user.buyerId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== OrderStatus.DELIVERED) {
    return NextResponse.json({ error: "Order must be delivered before review" }, { status: 400 });
  }
  if (order.review) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const body = reviewSchema.parse(await req.json());
  const farmerId = order.items[0]?.farmerId;
  if (!farmerId) return NextResponse.json({ error: "No items" }, { status: 400 });

  const review = await prisma.review.create({
    data: {
      orderId: order.id,
      rating: body.rating,
      comment: body.comment,
      reviewerId: user.id,
      farmerId,
    },
  });

  return NextResponse.json({ data: review });
}
