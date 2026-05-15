import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { driverId, isAvailable } = body;

    if (!driverId || typeof isAvailable !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { isAvailable },
    });

    return NextResponse.json({ data: driver });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json({ error: "Failed to update availability" }, { status: 500 });
  }
}
