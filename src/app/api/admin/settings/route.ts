import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session-user";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await prisma.platformSetting.findMany();
  return NextResponse.json({ data: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as Record<string, string | number | boolean | null | undefined>;
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    await prisma.platformSetting.upsert({
      where: { key },
      create: { key, value: String(value) },
      update: { value: String(value) },
    });
  }
  return NextResponse.json({ ok: true });
}
