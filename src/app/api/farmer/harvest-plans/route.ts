import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const planSchema = z.object({
  nameEn: z.string().min(2),
  nameAm: z.string().optional(),
  quantityKg: z.number().positive(),
  harvestDate: z.string().datetime(),
  notes: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.harvestPlan.findMany({
    where: { farmerId: user.farmerId },
    orderBy: { harvestDate: "asc" },
  });
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = planSchema.parse(await req.json());
  const row = await prisma.harvestPlan.create({
    data: {
      farmerId: user.farmerId,
      nameEn: body.nameEn,
      nameAm: body.nameAm,
      quantityKg: body.quantityKg,
      harvestDate: new Date(body.harvestDate),
      notes: body.notes,
    },
  });
  return NextResponse.json({ data: row });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  
  await prisma.harvestPlan.deleteMany({
    where: { id, farmerId: user.farmerId },
  });
  
  return NextResponse.json({ success: true });
}