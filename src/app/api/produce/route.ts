import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
  const region = searchParams.get("region")?.trim();
  const minPrice = Number(searchParams.get("minPrice") || NaN);
  const maxPrice = Number(searchParams.get("maxPrice") || NaN);
  const verifiedOnly = searchParams.get("verifiedOnly") === "1";
  const deliveryOnly = searchParams.get("deliveryOnly") === "1";

  const farmerWhere: Prisma.FarmerWhereInput = {};
  if (region) farmerWhere.region = { equals: region, mode: "insensitive" };
  if (verifiedOnly) farmerWhere.user = { is: { verified: true } };

  const priceFilter: Prisma.FloatFilter = {};
  if (Number.isFinite(minPrice)) priceFilter.gte = minPrice;
  if (Number.isFinite(maxPrice)) priceFilter.lte = maxPrice;

  const where: Prisma.ProduceWhereInput = {
    isAvailable: true,
    ...(Object.keys(farmerWhere).length ? { farmer: farmerWhere } : {}),
    ...(q
      ? {
          OR: [
            { nameEn: { contains: q, mode: "insensitive" } },
            { nameAm: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
    ...(Object.keys(priceFilter).length ? { pricePerKg: priceFilter } : {}),
    ...(deliveryOnly ? { deliveryOffered: true } : {}),
  };

  const rows = await prisma.produce.findMany({
    where,
    take: 60,
    orderBy: { updatedAt: "desc" },
    include: {
      farmer: { include: { user: { select: { nameEn: true, verified: true } } } },
    },
  });

  return NextResponse.json({ data: rows });
}
