'use client'

import { useState, useEffect } from 'react'

interface SavingsData {
  etbSaved: number
  hoursSaved: number
  kmAvoided: number
  ordersCount: number
}

export function SavingsWidget() {
  const [data, setData] = useState<SavingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/buyer/savings')
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({ etbSaved: 0, hoursSaved: 0, kmAvoided: 0, ordersCount: 0 }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl p-6 animate-pulse" style={{ background: '#F5F0E8', borderLeft: '4px solid #D4A017' }}>
        <div className="h-6 w-64 rounded" style={{ background: '#8B451320' }} />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="h-20 rounded" style={{ background: '#8B451320' }} />
          <div className="h-20 rounded" style={{ background: '#8B451320' }} />
          <div className="h-20 rounded" style={{ background: '#8B451320' }} />
        </div>
      </div>
    )
  }

  if (!data || data.ordersCount === 0) {
    return null
  }

  return (
    <div className="rounded-xl p-6" style={{ background: '#F5F0E8', borderLeft: '4px solid #D4A017', borderRadius: '12px' }}>
      <h3 className="text-lg font-semibold" style={{ color: '#3d2914' }}>
        This Month, You Avoided Atikilt Tera
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#2d6a4f' }}>
            {data.etbSaved.toLocaleString()}
          </p>
          <p className="text-sm" style={{ color: '#8B4513' }}>ETB Saved</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: '#D4A017' }}>
            {data.hoursSaved}h
          </p>
          <p className="text-sm" style={{ color: '#8B4513' }}>Time Saved</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold" style={{ color: '#8B4513' }}>
            {data.kmAvoided}km
          </p>
          <p className="text-sm" style={{ color: '#8B4513' }}>Travel Avoided</p>
        </div>
      </div>
    </div>
  )
}
