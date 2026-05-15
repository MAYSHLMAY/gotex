import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  nameEn: z.string().min(2),
  nameAm: z.string().min(1),
  category: z.string().min(2),
  quantityKg: z.number().positive(),
  pricePerKg: z.number().positive(),
  minOrderKg: z.number().positive(),
  grade: z.enum(["A", "B", "C"]),
  harvestDate: z.string().datetime(),
  freshnessWindow: z.number().int().positive(),
  imageUrls: z.array(z.string().url()).default([]),
  deliveryOffered: z.boolean().optional(),
  deliveryRadiusKm: z.number().positive().optional().nullable(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.produce.findMany({
    where: { farmerId: user.farmerId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createSchema.parse(await req.json());
    const created = await prisma.produce.create({
      data: {
        farmerId: user.farmerId,
        nameEn: body.nameEn,
        nameAm: body.nameAm,
        category: body.category,
        quantityKg: body.quantityKg,
        pricePerKg: body.pricePerKg,
        minOrderKg: body.minOrderKg,
        grade: body.grade,
        harvestDate: new Date(body.harvestDate),
        freshnessWindow: body.freshnessWindow,
        imageUrls: body.imageUrls.length ? body.imageUrls : ["/favicon.ico"],
        deliveryOffered: Boolean(body.deliveryOffered),
        deliveryRadiusKm: body.deliveryRadiusKm ?? null,
      },
    });
    return NextResponse.json({ data: created });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.flatten() }, { status: 422 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
