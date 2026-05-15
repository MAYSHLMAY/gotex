import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session-user'

// GET: Returns all open logistics requests (status = SEARCHING)
export async function GET() {
  try {
    const requests = await prisma.logisticsRequest.findMany({
      where: { status: 'SEARCHING' },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: requests })
  } catch (error) {
    console.error('[Logistics Requests GET Error]:', error)
    return NextResponse.json({ error: 'Failed to fetch logistics requests' }, { status: 500 })
  }
}

// POST: Creates a new logistics request
export async function POST(req: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      orderId,
      pickupAddress,
      pickupLat,
      pickupLng,
      dropoffAddress,
      dropoffLat,
      dropoffLng,
      weightKg,
      requiresRefrigeration = false,
      offeredPriceEtb,
    } = body

    // Validate required fields
    if (!orderId || !pickupAddress || !dropoffAddress || !weightKg || !offeredPriceEtb) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if request already exists for this order
    const existing = await prisma.logisticsRequest.findUnique({
      where: { orderId },
    })
    if (existing) {
      return NextResponse.json({ error: 'Logistics request already exists for this order' }, { status: 400 })
    }

    const request = await prisma.logisticsRequest.create({
      data: {
        orderId,
        pickupAddress,
        pickupLat: pickupLat ?? 9.0257,
        pickupLng: pickupLng ?? 38.7468,
        dropoffAddress,
        dropoffLat: dropoffLat ?? 9.0257,
        dropoffLng: dropoffLng ?? 38.7468,
        weightKg,
        requiresRefrigeration,
        offeredPriceEtb,
        status: 'SEARCHING',
      },
    })

    return NextResponse.json({ data: request })
  } catch (error) {
    console.error('[Logistics Requests POST Error]:', error)
    return NextResponse.json({ error: 'Failed to create logistics request' }, { status: 500 })
  }
}
