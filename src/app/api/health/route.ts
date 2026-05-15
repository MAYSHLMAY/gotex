import { NextResponse } from "next/server";
import { checkEnvVariables, isReadyForProduction } from "@/lib/env-check";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const envStatus = checkEnvVariables();
  
  // Test database connection
  let dbConnected = false;
  let dbError = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Unknown error";
  }

  const status = {
    healthy: dbConnected && isReadyForProduction(),
    timestamp: new Date().toISOString(),
    database: {
      connected: dbConnected,
      error: dbError,
    },
    environment: envStatus.map((e) => ({
      key: e.key,
      label: e.label,
      required: e.required,
      configured: e.configured,
      fallback: e.fallback,
    })),
    readyForProduction: isReadyForProduction(),
  };

  return NextResponse.json(status, {
    status: status.healthy ? 200 : 503,
  });
}
