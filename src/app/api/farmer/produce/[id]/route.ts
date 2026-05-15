import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  nameEn: z.string().min(2).optional(),
  nameAm: z.string().min(1).optional(),
  category: z.string().min(2).optional(),
  quantityKg: z.number().positive().optional(),
  pricePerKg: z.number().positive().optional(),
  minOrderKg: z.number().positive().optional(),
  grade: z.enum(["A", "B", "C"]).optional(),
  harvestDate: z.string().datetime().optional(),
  freshnessWindow: z.number().int().positive().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  isAvailable: z.boolean().optional(),
  deliveryOffered: z.boolean().optional(),
  deliveryRadiusKm: z.number().positive().nullable().optional(),
});

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.produce.findFirst({
    where: { id: params.id, farmerId: user.farmerId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const body = patchSchema.parse(await req.json());
    const updated = await prisma.produce.update({
      where: { id: params.id },
      data: {
        ...body,
        harvestDate: body.harvestDate ? new Date(body.harvestDate) : undefined,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.flatten() }, { status: 422 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.produce.findFirst({
    where: { id: params.id, farmerId: user.farmerId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.produce.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
