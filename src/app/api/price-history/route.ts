import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const produceName = searchParams.get('produce') || 'Tomatoes'

    const history = await prisma.priceHistory.findMany({
      where: { produceName },
      orderBy: { recordedAt: 'asc' },
      take: 30,
    })

    const data = history.map(h => ({
      date: h.recordedAt.toISOString().split('T')[0],
      goteraPrice: h.goteraPrice,
      atikiltTeraPrice: h.atikiltTeraPrice,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('[Price History Error]:', error)
    return NextResponse.json([])
  }
}
