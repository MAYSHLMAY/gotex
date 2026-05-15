import { NextResponse } from 'next/server'
import { askGroq } from '@/lib/groq'

export async function POST(req: Request) {
  try {
    const { pickupAddress, dropoffAddress, weightKg, produceType, requiresRefrigeration } = await req.json()
    
    const systemPrompt = `You are a logistics optimizer for agricultural freight in Ethiopia. Recommend vehicle type (motorcycle/pickup/truck/refrigerated_truck), estimated cost in ETB, and best time window. Be brief and specific. Average rates: motorcycle 50 ETB base, pickup 200 ETB base, truck 500 ETB base + 2 ETB/km.`
    
    const userMessage = `
Pickup: ${pickupAddress}
Dropoff: ${dropoffAddress}
Weight: ${weightKg} kg
Produce type: ${produceType}
Requires refrigeration: ${requiresRefrigeration ? 'Yes' : 'No'}

Recommend the best logistics option.`

    const suggestion = await askGroq(systemPrompt, userMessage)
    
    return NextResponse.json({ suggestion })
  } catch (error) {
    console.error('[AI Logistics Suggest Error]:', error)
    return NextResponse.json({ suggestion: 'AI logistics advisor is temporarily unavailable. Please try again.' })
  }
}
