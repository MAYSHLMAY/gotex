'use client'

import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const PRODUCE_OPTIONS = [
  'Tomatoes',
  'Red Onions',
  'Potatoes',
  'Green Pepper',
  'Garlic',
  'Ginger',
  'Berbere Peppers',
  'Avocado',
]

interface PriceData {
  date: string
  goteraPrice: number
  atikiltTeraPrice: number
}

export function PriceChart() {
  const [selectedProduce, setSelectedProduce] = useState('Tomatoes')
  const [data, setData] = useState<PriceData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/price-history?produce=${encodeURIComponent(selectedProduce)}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false))
  }, [selectedProduce])

  // Calculate current prices and savings
  const latestData = data[data.length - 1]
  const savingsPercent = latestData 
    ? Math.round((1 - latestData.goteraPrice / latestData.atikiltTeraPrice) * 100) 
    : 0

  return (
    <div className="rounded-xl p-6" style={{ background: '#FFFDF8', border: '1px solid #D4A01730' }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#3d2914' }}>Market Pulse</h3>
          <p className="text-sm" style={{ color: '#8B4513' }}>30-day price comparison</p>
        </div>
        <select
          value={selectedProduce}
          onChange={(e) => setSelectedProduce(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm"
          style={{ background: '#F5F0E8', border: '1px solid #D4A01730', color: '#3d2914' }}
        >
          {PRODUCE_OPTIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Market Pulse Summary */}
      {latestData && (
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-lg" style={{ background: '#F5F0E8' }}>
          <div className="text-center">
            <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Gotera Price</p>
            <p className="text-xl font-bold" style={{ color: '#2d6a4f' }}>{latestData.goteraPrice} ETB</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Atikilt Tera</p>
            <p className="text-xl font-bold line-through" style={{ color: '#c9302c' }}>{latestData.atikiltTeraPrice} ETB</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase" style={{ color: '#8B4513' }}>You Save</p>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold" style={{ background: '#D4A017', color: '#1A1A2E' }}>
              {savingsPercent}%
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="inline-block w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#D4A017', borderTopColor: 'transparent' }} />
        </div>
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGotera" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorAtikilt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c9302c" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#c9302c" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#D4A01730" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B4513' }} />
            <YAxis tick={{ fontSize: 10, fill: '#8B4513' }} />
            <Tooltip 
              contentStyle={{ background: '#FFFDF8', border: '1px solid #D4A017', borderRadius: '8px' }}
              labelStyle={{ color: '#3d2914' }}
            />
            <Legend />
            <Area type="monotone" dataKey="goteraPrice" name="Gotera" stroke="#2d6a4f" fillOpacity={1} fill="url(#colorGotera)" />
            <Area type="monotone" dataKey="atikiltTeraPrice" name="Atikilt Tera" stroke="#c9302c" fillOpacity={1} fill="url(#colorAtikilt)" />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p className="text-sm" style={{ color: '#8B4513' }}>No price history available for {selectedProduce}</p>
        </div>
      )}
    </div>
  )
}
