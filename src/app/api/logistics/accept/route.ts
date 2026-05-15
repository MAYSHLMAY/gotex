import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session-user'

// POST: Accepts a logistics request
export async function POST(req: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { requestId, driverId } = body

    if (!requestId || !driverId) {
      return NextResponse.json({ error: 'Missing requestId or driverId' }, { status: 400 })
    }

    // Verify the driver exists and is available
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    })
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }
    if (!driver.isAvailable) {
      return NextResponse.json({ error: 'Driver is not available' }, { status: 400 })
    }

    // Verify the request exists and is still searching
    const request = await prisma.logisticsRequest.findUnique({
      where: { id: requestId },
    })
    if (!request) {
      return NextResponse.json({ error: 'Logistics request not found' }, { status: 404 })
    }
    if (request.status !== 'SEARCHING') {
      return NextResponse.json({ error: 'Request is no longer available' }, { status: 400 })
    }

    // Update request status to ASSIGNED
    const updatedRequest = await prisma.logisticsRequest.update({
      where: { id: requestId },
      data: {
        status: 'ASSIGNED',
        acceptedDriverId: driverId,
      },
    })

    // Mark driver as unavailable
    await prisma.driver.update({
      where: { id: driverId },
      data: { isAvailable: false },
    })

    return NextResponse.json({ data: updatedRequest })
  } catch (error) {
    console.error('[Logistics Accept Error]:', error)
    return NextResponse.json({ error: 'Failed to accept request' }, { status: 500 })
  }
}
