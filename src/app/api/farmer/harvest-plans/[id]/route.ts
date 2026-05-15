import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.harvestPlan.findFirst({
    where: { id: params.id, farmerId: user.farmerId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.harvestPlan.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
