import { NextResponse } from "next/server";
import { z } from "zod";
import { RfqStatus } from "@prisma/client";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  status: z.nativeEnum(RfqStatus).optional(),
});

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "BUYER" || !user.buyerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rfq = await prisma.rfq.findUnique({ where: { id: params.id } });
  if (!rfq || rfq.buyerId !== user.buyerId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = patchSchema.parse(await req.json());
  const updated = await prisma.rfq.update({
    where: { id: rfq.id },
    data: { status: body.status ?? rfq.status },
  });
  return NextResponse.json({ data: updated });
}
