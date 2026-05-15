import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  cooperativeId: z.string().nullable(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const farmer = await prisma.farmer.findUnique({
    where: { id: user.farmerId },
    include: { cooperative: true },
  });
  return NextResponse.json({ data: farmer });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = patchSchema.parse(await req.json());
  if (body.cooperativeId) {
    const coop = await prisma.cooperative.findUnique({ where: { id: body.cooperativeId } });
    if (!coop) return NextResponse.json({ error: "Cooperative not found" }, { status: 404 });
  }

  const updated = await prisma.farmer.update({
    where: { id: user.farmerId },
    data: { cooperativeId: body.cooperativeId },
    include: { cooperative: true },
  });
  return NextResponse.json({ data: updated });
}
