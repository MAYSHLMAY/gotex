import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  id: z.string(),
  status: z.string().min(2),
  resolution: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: true, openedBy: true },
  });
  return NextResponse.json({ data: rows });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = patchSchema.parse(await req.json());
  const updated = await prisma.dispute.update({
    where: { id: body.id },
    data: { status: body.status, resolution: body.resolution },
  });
  return NextResponse.json({ data: updated });
}
