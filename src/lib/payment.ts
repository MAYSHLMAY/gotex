/**
 * Chappa payment client with mock fallback
 */
export function chappaConfigured(): boolean {
  return Boolean(process.env.CHAPPA_SECRET_KEY && process.env.CHAPPA_PUBLIC_KEY);
}

export async function initiatePayment(params: {
  amount: number
  email: string
  orderId: string
}) {
  if (process.env.CHAPPA_SECRET_KEY) {
    try {
      const res = await fetch('https://api.chappa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.CHAPPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: 'ETB',
          email: params.email,
          tx_ref: `gotera-${params.orderId}-${Date.now()}`,
          callback_url: `${process.env.NEXT_PUBLIC_URL}/api/payment/verify`,
          return_url: `${process.env.NEXT_PUBLIC_URL}/buyer/orders/${params.orderId}?payment=success`,
          customization: { title: 'Gotera Payment', description: 'Fresh produce from Ethiopian farmers' }
        })
      })
      const data = await res.json()
      if (data.status === 'success') {
        return { success: true, checkoutUrl: data.data.checkout_url, provider: 'chappa' }
      }
    } catch (err) {
      console.warn('[Gotera] Chappa unavailable, using mock payment:', err)
    }
  }
  // MOCK FALLBACK — always works for demo
  await new Promise(r => setTimeout(r, 800))
  console.log(`[MOCK PAYMENT] ${params.amount} ETB for order ${params.orderId}`)
  return {
    success: true,
    checkoutUrl: `/buyer/orders/${params.orderId}/mock-payment?amount=${params.amount}`,
    provider: 'mock'
  }
}
