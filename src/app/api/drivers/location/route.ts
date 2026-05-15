import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session-user'

// PATCH: Updates driver location
export async function PATCH(req: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { driverId, lat, lng } = body

    if (!driverId || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: 'Missing driverId, lat, or lng' }, { status: 400 })
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
    })
    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    const updatedDriver = await prisma.driver.update({
      where: { id: driverId },
      data: {
        currentLat: lat,
        currentLng: lng,
      },
    })

    return NextResponse.json({ data: updatedDriver })
  } catch (error) {
    console.error('[Driver Location Update Error]:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}

// GET: Get driver location by ID (for tracking)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const driverId = searchParams.get('driverId')

    if (!driverId) {
      return NextResponse.json({ error: 'Missing driverId' }, { status: 400 })
    }

    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
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
    })

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    return NextResponse.json({ data: driver })
  } catch (error) {
    console.error('[Driver Location GET Error]:', error)
    return NextResponse.json({ error: 'Failed to get driver location' }, { status: 500 })
  }
}
