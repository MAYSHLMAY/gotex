'use client'

import { useState, useEffect, useRef } from 'react'

interface AIPriceCoachProps {
  produceName: string
  farmerPrice: number
  atikiltTeraPrice?: number
  quantity: number
}

export function AIPriceCoach({ produceName, farmerPrice, atikiltTeraPrice, quantity }: AIPriceCoachProps) {
  const [advice, setAdvice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [popupPosition, setPopupPosition] = useState<'bottom' | 'top' | 'left' | 'right'>('bottom')
  const buttonRef = useRef<HTMLDivElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)

  async function askCoach() {
    setLoading(true)
    setShowPopup(true)
    try {
      const res = await fetch('/api/ai/price-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produceName,
          farmerPrice,
          platformAvg: farmerPrice,
          atikiltTeraPrice: atikiltTeraPrice || farmerPrice * 1.5,
          quantity,
          lang: 'en'
        })
      })
      const data = await res.json()
      setAdvice(data.advice)
    } catch {
      setAdvice('AI advisor is temporarily unavailable. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate popup position to avoid overflow
  useEffect(() => {
    if (showPopup && buttonRef.current && popupRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const popupRect = popupRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Check if popup would go off-screen on the right
      if (buttonRect.left + popupRect.width > viewportWidth - 10) {
        setPopupPosition('left')
      } 
      // Check if popup would go off-screen on the bottom
      else if (buttonRect.bottom + popupRect.height > viewportHeight - 10) {
        setPopupPosition('top')
      } 
      else {
        setPopupPosition('bottom')
      }
    }
  }, [showPopup])

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowPopup(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getPopupStyles = () => {
    const baseStyles = {
      position: 'fixed' as const,
      zIndex: 9999,
      width: '280px',
      padding: '1rem',
      borderRadius: '12px',
      background: '#FFFDF8',
      border: '2px solid #D4A017',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)'
    }

    if (!buttonRef.current) return baseStyles

    const rect = buttonRef.current.getBoundingClientRect()

    switch(popupPosition) {
      case 'top':
        return { ...baseStyles, bottom: window.innerHeight - rect.top + 8, left: rect.left }
      case 'left':
        return { ...baseStyles, top: rect.top, right: window.innerWidth - rect.left + 8 }
      default: // bottom
        return { ...baseStyles, top: rect.bottom + 8, left: rect.left }
    }
  }

  return (
    <>
      <div ref={buttonRef} className="relative inline-block">
        <button
          onClick={askCoach}
          className="text-xs px-2 py-1 rounded-lg transition-colors hover:opacity-80"
          style={{ background: '#D4A01720', color: '#8B4513', border: '1px solid #D4A01750' }}
        >
          Ask AI Coach
        </button>
      </div>
      
      {showPopup && (
        <div ref={popupRef} style={getPopupStyles()}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold" style={{ color: '#8B4513' }}>AI Price Coach</span>
            <button 
              onClick={() => setShowPopup(false)}
              className="text-xs hover:opacity-70"
              style={{ color: '#8B4513' }}
            >
              ✕
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#D4A017', borderTopColor: 'transparent' }} />
              <span className="text-sm" style={{ color: '#8B4513' }}>Analyzing market data...</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed" style={{ color: '#3d2914' }}>{advice}</p>
          )}
        </div>
      )}
    </>
  )
}