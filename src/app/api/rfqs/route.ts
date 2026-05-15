import { NextResponse } from "next/server";
import { z } from "zod";
import { RfqStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  produceType: z.string().min(2),
  quantityKg: z.number().positive(),
  frequency: z.string().min(2),
  durationDays: z.number().int().positive(),
  deadline: z.string().datetime(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "ADMIN") {
    const rows = await prisma.rfq.findMany({ orderBy: { createdAt: "desc" }, include: { buyer: true, bids: true } });
    return NextResponse.json({ data: rows });
  }

  if (user.role === "BUYER" && user.buyerId) {
    const rows = await prisma.rfq.findMany({
      where: { buyerId: user.buyerId },
      orderBy: { createdAt: "desc" },
      include: { bids: { include: { farmer: { include: { user: true } } } } },
    });
    return NextResponse.json({ data: rows });
  }

  if (user.role === "FARMER") {
    const rows = await prisma.rfq.findMany({
      where: { status: RfqStatus.OPEN, deadline: { gte: new Date() } },
      orderBy: { deadline: "asc" },
      take: 50,
      include: { buyer: true },
    });
    return NextResponse.json({ data: rows });
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
    const rfq = await prisma.rfq.create({
      data: {
        buyerId: user.buyerId,
        produceType: body.produceType,
        quantityKg: body.quantityKg,
        frequency: body.frequency,
        durationDays: body.durationDays,
        deadline: new Date(body.deadline),
      },
    });
    return NextResponse.json({ data: rfq });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.flatten() }, { status: 422 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
