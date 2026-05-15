import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2),
  lines: z.array(
    z.object({
      nameEn: z.string().min(1),
      nameAm: z.string().optional(),
      targetKg: z.number().positive(),
    }),
  ),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.procurementTemplate.findMany({
    where: { buyerId: user.buyerId },
    orderBy: { createdAt: "desc" },
    include: { lines: true },
  });
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = createSchema.parse(await req.json());
  const tpl = await prisma.procurementTemplate.create({
    data: {
      buyerId: user.buyerId,
      name: body.name,
      lines: { create: body.lines },
    },
    include: { lines: true },
  });
  return NextResponse.json({ data: tpl });
}
