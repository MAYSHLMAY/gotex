import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const postSchema = z.object({ farmerId: z.string() });

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.favoriteFarmer.findMany({
    where: { buyerId: user.buyerId },
    include: { farmer: { include: { user: true, cooperative: true } } },
  });
  return NextResponse.json({ data: rows });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = postSchema.parse(await req.json());
  const fav = await prisma.favoriteFarmer.upsert({
    where: { buyerId_farmerId: { buyerId: user.buyerId, farmerId: body.farmerId } },
    create: { buyerId: user.buyerId, farmerId: body.farmerId },
    update: {},
    include: { farmer: { include: { user: true } } },
  });
  return NextResponse.json({ data: fav });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const farmerId = new URL(req.url).searchParams.get("farmerId");
  if (!farmerId) return NextResponse.json({ error: "farmerId required" }, { status: 400 });

  await prisma.favoriteFarmer.deleteMany({
    where: { buyerId: user.buyerId, farmerId },
  });
  return NextResponse.json({ ok: true });
}
