import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  userId: z.string(),
  verified: z.boolean(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { farmer: true, buyer: true },
  });
  return NextResponse.json({ data: rows });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = patchSchema.parse(await req.json());
  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: { verified: body.verified },
  });
  return NextResponse.json({ data: updated });
}
