import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { orderId: string } }

// GET: Get logistics request by orderId
export async function GET(_req: Request, { params }: Params) {
  try {
    const { orderId } = params

    const request = await prisma.logisticsRequest.findUnique({
      where: { orderId },
      include: {
        acceptedDriver: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
            plateNumber: true,
            currentLat: true,
            currentLng: true,
            rating: true,
          },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: request })
  } catch (error) {
    console.error('[Logistics By Order Error]:', error)
    return NextResponse.json({ error: 'Failed to fetch logistics request' }, { status: 500 })
  }
}

// PATCH: Update logistics status
export async function PATCH(req: Request, { params }: Params) {
  try {
    const { orderId } = params
    const body = await req.json()
    const { status } = body

    if (!status || !['SEARCHING', 'ASSIGNED', 'PICKED_UP', 'DELIVERED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const request = await prisma.logisticsRequest.findUnique({
      where: { orderId },
    })

    if (!request) {
      return NextResponse.json({ error: 'Logistics request not found' }, { status: 404 })
    }

    const updatedRequest = await prisma.logisticsRequest.update({
      where: { orderId },
      data: { status },
    })

    // If delivered, mark driver as available again and increment their delivery count
    if (status === 'DELIVERED' && request.acceptedDriverId) {
      await prisma.driver.update({
        where: { id: request.acceptedDriverId },
        data: {
          isAvailable: true,
          totalDeliveries: { increment: 1 },
        },
      })
    }

    return NextResponse.json({ data: updatedRequest })
  } catch (error) {
    console.error('[Logistics Status Update Error]:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
