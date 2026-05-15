import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.buyerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const buyerId = session.user.buyerId

    // Get all delivered orders for this buyer
    const orders = await prisma.order.findMany({
      where: {
        buyerId,
        status: 'DELIVERED',
      },
      select: {
        totalAmountETB: true,
        atikiltTeraBaselineEtb: true,
      },
    })

    const totalPaid = orders.reduce((sum, o) => sum + o.totalAmountETB, 0)
    const atikiltTeraBaseline = orders.reduce((sum, o) => sum + (o.atikiltTeraBaselineEtb ?? o.totalAmountETB * 1.5), 0)
    const etbSaved = Math.round(atikiltTeraBaseline - totalPaid)
    const hoursSaved = orders.length * 3 // 3 hours saved per order
    const kmAvoided = orders.length * 15 // 15km round trip to Atikilt Tera

    return NextResponse.json({
      etbSaved,
      hoursSaved,
      kmAvoided,
      ordersCount: orders.length,
    })
  } catch (error) {
    console.error('[Buyer Savings Error]:', error)
    return NextResponse.json({ etbSaved: 0, hoursSaved: 0, kmAvoided: 0, ordersCount: 0 })
  }
}
