/**
 * SMS service with AfroMessage integration and mock fallback
 */
const SMS_TEMPLATES = {
  orderConfirmed: (ref: string) => `Gotera: ትዕዛዝ ${ref} ተረጋግጧል። ምርትዎ እየተዘጋጀ ነው።`,
  orderDispatched: (driver: string) => `Gotera: ትዕዛዝዎ ${driver} ጋር ተልኳል። በመተግበሪያው ይከታተሉ።`,
  orderDelivered: () => `Gotera: ትዕዛዝዎ ደርሷል! እባክዎ ይገምግሙ።`,
  newOrder: (buyer: string, amount: string) => `Gotera: ${buyer} ከ${amount} ETB አዲስ ትዕዛዝ ላኩልዎ።`,
  paymentReceived: (amount: string) => `Gotera: ${amount} ETB ተቀብለናል። በ24 ሰዓት ይተላለፋል።`,
}

export async function sendSMS(phone: string, templateKey: keyof typeof SMS_TEMPLATES, ...args: string[]) {
  const message = (SMS_TEMPLATES[templateKey] as (...a: string[]) => string)(...args)

  if (process.env.AFROMESSAGE_API_KEY) {
    try {
      const res = await fetch('https://api.afromessage.com/api/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AFROMESSAGE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ to: phone, message, sender: 'GOTERA' })
      })
      const data = await res.json()
      if (data.acknowledge === 'success') return true
    } catch (err) {
      console.warn('[Gotera] AfroMessage unavailable:', err)
    }
  }

  console.log(`[SMS FALLBACK] → ${phone}: ${message}`)
  return true
}
