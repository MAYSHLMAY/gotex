import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.cooperative.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { farmers: true } } },
  });
  return NextResponse.json({ data: rows });
}
