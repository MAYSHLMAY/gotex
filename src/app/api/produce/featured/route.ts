import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FeaturedProduce } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await prisma.produce.findMany({
      where: { isAvailable: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        farmer: {
          include: { user: { select: { nameEn: true } } },
        },
      },
    });

    const data: FeaturedProduce[] = rows.map((p) => ({
      id: p.id,
      nameEn: p.nameEn,
      nameAm: p.nameAm,
      category: p.category,
      quantityKg: p.quantityKg,
      pricePerKg: p.pricePerKg,
      grade: p.grade,
      region: p.farmer.region,
      farmerName: p.farmer.user.nameEn,
      imageUrls: p.imageUrls,
      trustScore: p.farmer.trustScore,
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      {
        data: [] as FeaturedProduce[],
        error: "Database unavailable — configure DATABASE_URL and run prisma db push && prisma db seed.",
      },
      { status: 200 },
    );
  }
}
