import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const farmerSchema = z.object({
  role: z.literal("FARMER"),
  nameEn: z.string().min(2),
  nameAm: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(8),
  region: z.string().min(2),
  woreda: z.string().min(2),
  farmSizeSqm: z.number().positive(),
  farmTypes: z.array(z.string()).min(1),
  lat: z.number(),
  lng: z.number(),
});

const buyerSchema = z.object({
  role: z.literal("BUYER"),
  nameEn: z.string().min(2),
  nameAm: z.string().optional(),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(8),
  businessName: z.string().min(2),
  businessLicense: z.string().optional(),
  city: z.string().min(2),
  businessType: z.string().min(2),
  deliveryAddress: z.string().optional(),
  procurementFreq: z.enum(["daily", "weekly", "monthly"]).optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const role = json.role as string;

    if (role === "FARMER") {
      const data = farmerSchema.parse(json);
      const exists = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (exists) return NextResponse.json({ error: "Phone already registered" }, { status: 409 });

      const passwordHash = await bcrypt.hash(data.password, 10);
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            role: Role.FARMER,
            nameEn: data.nameEn,
            nameAm: data.nameAm,
            phone: data.phone,
            email: data.email || null,
            passwordHash,
            verified: false,
          },
        });
        await tx.farmer.create({
          data: {
            userId: user.id,
            region: data.region,
            woreda: data.woreda,
            farmSizeSqm: data.farmSizeSqm,
            farmTypes: data.farmTypes,
            lat: data.lat,
            lng: data.lng,
          },
        });
      });
      return NextResponse.json({ ok: true });
    }

    if (role === "BUYER") {
      const data = buyerSchema.parse(json);
      const exists = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (exists) return NextResponse.json({ error: "Phone already registered" }, { status: 409 });

      const passwordHash = await bcrypt.hash(data.password, 10);
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            role: Role.BUYER,
            nameEn: data.nameEn,
            nameAm: data.nameAm,
            phone: data.phone,
            email: data.email || null,
            passwordHash,
            verified: false,
          },
        });
        await tx.buyer.create({
          data: {
            userId: user.id,
            businessName: data.businessName,
            businessLicense: data.businessLicense,
            contactPerson: data.nameEn,
            city: data.city,
            businessType: data.businessType,
            deliveryAddress: data.deliveryAddress,
            procurementFreq: data.procurementFreq,
          },
        });
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unsupported role" }, { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload", issues: e.flatten() }, { status: 422 });
    }
    console.error(e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
