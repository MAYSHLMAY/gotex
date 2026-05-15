import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

const bidSchema = z.object({
  pricePerKg: z.number().positive(),
  quantityKg: z.number().positive(),
  message: z.string().max(2000).optional(),
});

type Params = { params: { id: string } };

export async function POST(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user || user.role !== "FARMER" || !user.farmerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rfq = await prisma.rfq.findUnique({ where: { id: params.id } });
  if (!rfq || rfq.status !== "OPEN") return NextResponse.json({ error: "RFQ not available" }, { status: 400 });

  const body = bidSchema.parse(await req.json());
  const bid = await prisma.rfqBid.create({
    data: {
      rfqId: rfq.id,
      farmerId: user.farmerId,
      pricePerKg: body.pricePerKg,
      quantityKg: body.quantityKg,
      message: body.message,
    },
  });

  return NextResponse.json({ data: bid });
}
