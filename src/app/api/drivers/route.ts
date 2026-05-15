import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/session-user'

// GET: Get driver by userId or all available drivers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (userId) {
      const driver = await prisma.driver.findUnique({
        where: { userId },
      })
      return NextResponse.json({ data: driver })
    }

    // Return all available drivers
    const drivers = await prisma.driver.findMany({
      where: { isAvailable: true },
    })
    return NextResponse.json({ data: drivers })
  } catch (error) {
    console.error('[Drivers GET Error]:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  }
}

// POST: Register as a driver
export async function POST(req: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, vehicleType, plateNumber, capacityKg, refrigerated = false, lat, lng } = body

    if (!name || !phone || !vehicleType || !plateNumber || !capacityKg) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user is already a driver
    const existing = await prisma.driver.findUnique({
      where: { userId: user.id },
    })
    if (existing) {
      return NextResponse.json({ error: 'User is already registered as a driver' }, { status: 400 })
    }

    const driver = await prisma.driver.create({
      data: {
        userId: user.id,
        name,
        phone,
        vehicleType,
        plateNumber,
        capacityKg,
        refrigerated,
        currentLat: lat,
        currentLng: lng,
        isAvailable: true,
      },
    })

    return NextResponse.json({ data: driver })
  } catch (error) {
    console.error('[Drivers POST Error]:', error)
    return NextResponse.json({ error: 'Failed to register driver' }, { status: 500 })
  }
}
