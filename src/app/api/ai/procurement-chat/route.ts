import { NextResponse } from 'next/server'
import { askGroq } from '@/lib/groq'

export async function POST(req: Request) {
  try {
    const { message, availableProduce, conversationHistory } = await req.json()
    
    const systemPrompt = `You are Gotera's procurement assistant for Ethiopian hotels and restaurants. You help buyers plan bulk produce orders. You know Ethiopian cuisine and typical menu requirements. Available produce this week: ${availableProduce}. Give specific quantities in kg. Be concise and practical.`
    
    // Build conversation context
    let contextMessages = ''
    if (conversationHistory && conversationHistory.length > 0) {
      contextMessages = conversationHistory.slice(-6).map((m: { role: string; content: string }) => 
        `${m.role === 'user' ? 'Customer' : 'Assistant'}: ${m.content}`
      ).join('\n')
    }
    
    const userMessage = contextMessages 
      ? `Previous conversation:\n${contextMessages}\n\nCustomer: ${message}`
      : message

    const reply = await askGroq(systemPrompt, userMessage)
    
    return NextResponse.json({ reply })
  } catch (error) {
    console.error('[AI Procurement Chat Error]:', error)
    return NextResponse.json({ reply: 'AI assistant is temporarily unavailable. Please try again.' })
  }
}
