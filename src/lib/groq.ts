import Groq from 'groq-sdk'

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null

export async function askGroq(systemPrompt: string, userMessage: string): Promise<string> {
  if (!groq) {
    console.warn('[Groq] GROQ_API_KEY not configured')
    return 'AI advisor is temporarily unavailable. Please try again.'
  }
  
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 400,
      temperature: 0.4,
    })
    return completion.choices[0]?.message?.content ?? 'AI response unavailable.'
  } catch (err) {
    console.warn('[Groq] AI unavailable:', err)
    return 'AI advisor is temporarily unavailable. Please try again.'
  }
}
