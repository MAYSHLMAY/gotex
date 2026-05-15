import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";
import { chappaConfigured } from "@/lib/chappa";

const checkoutSchema = z.object({
  orderId: z.string(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = checkoutSchema.parse(await req.json());
  const order = await prisma.order.findUnique({ where: { id: body.orderId } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role === "BUYER" && user.buyerId !== order.buyerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!chappaConfigured()) {
    return NextResponse.json({
      mock: true,
      message: "Chappa keys not configured — returning a sandbox payload.",
      orderId: order.id,
      amountETB: order.totalAmountETB,
    });
  }

  return NextResponse.json({
    mock: false,
    message: "Wire Chappa checkout session creation here.",
    orderId: order.id,
    amountETB: order.totalAmountETB,
  });
}
