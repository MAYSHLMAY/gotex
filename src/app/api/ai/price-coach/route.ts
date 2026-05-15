import { NextResponse } from 'next/server'
import { askGroq } from '@/lib/groq'

export async function POST(req: Request) {
  try {
    const { produceName, farmerPrice, platformAvg, atikiltTeraPrice, quantity, lang } = await req.json()
    
    const systemPrompt = `You are Gotera's agricultural price advisor for Ethiopian farmers. Give short 2-3 sentence practical pricing advice. If lang is 'am', respond in Amharic. Be encouraging and specific.`
    
    const userMessage = `
Produce: ${produceName}
Farmer's current price: ${farmerPrice} ETB/kg
Platform average: ${platformAvg || 'N/A'} ETB/kg
Atikilt Tera price: ${atikiltTeraPrice} ETB/kg
Available quantity: ${quantity} kg
Language: ${lang || 'en'}

Give pricing advice for this farmer.`

    const advice = await askGroq(systemPrompt, userMessage)
    
    return NextResponse.json({ advice })
  } catch (error) {
    console.error('[AI Price Coach Error]:', error)
    return NextResponse.json({ advice: 'AI advisor is temporarily unavailable. Please try again.' })
  }
}
