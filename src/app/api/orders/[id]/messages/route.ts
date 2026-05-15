import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const messageSchema = z.object({
  content: z.string().min(1).max(4000),
  voiceUrl: z.string().url().optional(),
});

type Params = { params: { id: string } };

async function canAccessOrder(user: NonNullable<Awaited<ReturnType<typeof getSessionUser>>>, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return null;
  if (user.role === "ADMIN") return order;
  if (user.role === "BUYER" && user.buyerId === order.buyerId) return order;
  if (user.role === "FARMER" && user.farmerId && order.items.some((i) => i.farmerId === user.farmerId)) return order;
  return null;
}

export async function GET(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await canAccessOrder(user, params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { orderId: params.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, nameEn: true, role: true } } },
  });
  return NextResponse.json({ data: messages });
}

export async function POST(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const order = await canAccessOrder(user, params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = messageSchema.parse(await req.json());
    const msg = await prisma.message.create({
      data: {
        orderId: params.id,
        senderId: user.id,
        content: body.content,
        voiceUrl: body.voiceUrl,
      },
    });
    return NextResponse.json({ data: msg });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.flatten() }, { status: 422 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
