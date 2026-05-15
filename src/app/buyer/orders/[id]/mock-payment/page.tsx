'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, use } from 'react'

export default function MockPaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount') || '0'
  const [loading, setLoading] = useState(false)

  async function handlePay() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1500))
    router.push(`/buyer/orders/${orderId}?payment=success`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0E8' }}>
      <div className="w-full max-w-md rounded-2xl p-8" style={{ background: '#FFFDF8', border: '2px solid #D4A017', boxShadow: '0 8px 32px rgba(139, 69, 19, 0.15)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6">
          <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden style={{ color: '#D4A017' }}>
            <path
              d="M18 46 L18 22 Q18 12 32 10 Q46 12 46 22 L46 46 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path d="M32 10 L32 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26 18 Q32 14 38 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div>
            <p style={{ fontWeight: 600, color: '#3d2914', fontSize: '18px' }}>ጎተራ</p>
            <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#8B4513' }}>Gotera</p>
          </div>
        </div>

        {/* Secure Demo Payment label */}
        <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-full" style={{ background: '#D4A01720', width: 'fit-content' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d6a4f" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#2d6a4f' }}>Secure Demo Payment</span>
        </div>

        {/* Amount */}
        <div className="mb-6">
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#8B4513', marginBottom: '8px' }}>Total Amount</p>
          <p style={{ fontSize: '48px', fontWeight: 700, color: '#3d2914' }}>
            {Number(amount).toLocaleString()} <span style={{ fontSize: '24px', fontWeight: 400 }}>ETB</span>
          </p>
        </div>

        {/* Order ID */}
        <div className="mb-8 p-4 rounded-lg" style={{ background: '#F5F0E8' }}>
          <p style={{ fontSize: '12px', color: '#8B4513', marginBottom: '4px' }}>Order Reference</p>
          <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#3d2914' }}>GOT-{orderId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full py-4 rounded-xl text-lg font-semibold transition-all"
          style={{
            background: loading ? '#8B4513' : '#D4A017',
            color: loading ? '#FFFDF8' : '#1A1A2E',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FFFDF8', borderTopColor: 'transparent' }} />
              Processing Payment...
            </span>
          ) : (
            'Pay Now'
          )}
        </button>

        {/* Footer note */}
        <p className="mt-6 text-center" style={{ fontSize: '11px', color: '#8B4513' }}>
          This is a demo payment page. No real transaction will occur.
        </p>
      </div>
    </div>
  )
}
