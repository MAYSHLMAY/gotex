'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { GoteraCard } from '@/components/ui/GoteraCard'

const GoteraMap = dynamic(() => import('@/components/shared/GoteraMap'), { ssr: false })

interface DriverInfo {
  id: string
  name: string
  phone: string
  vehicleType: string
  plateNumber: string
  currentLat: number | null
  currentLng: number | null
  rating: number
}

interface LogisticsRequest {
  id: string
  orderId: string
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropoffAddress: string
  dropoffLat: number
  dropoffLng: number
  status: string
  acceptedDriver: DriverInfo | null
}

const STATUS_STEPS = ['CONFIRMED', 'PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] as const

export default function TrackDeliveryPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  
  const [logistics, setLogistics] = useState<LogisticsRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch logistics data and poll for driver location
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    async function fetchLogistics() {
      try {
        const res = await fetch(`/api/logistics/${orderId}`)
        const data = await res.json()
        
        if (data.error) {
          setError('No delivery tracking available for this order.')
        } else if (data.data) {
          setLogistics(data.data)
        } else {
          setError('No delivery tracking available for this order.')
        }
      } catch (err) {
        console.error('[TrackDelivery] Error:', err)
        setError('Failed to load tracking information.')
      } finally {
        setLoading(false)
      }
    }

    fetchLogistics()

    // Poll every 10 seconds for driver location updates
    interval = setInterval(fetchLogistics, 10000)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [orderId])

  // Map current status to step index
  const getStatusIndex = (status: string) => {
    const statusMap: Record<string, number> = {
      'SEARCHING': -1,
      'ASSIGNED': 0,
      'PICKED_UP': 2,
      'DELIVERED': 4,
    }
    return statusMap[status] ?? 0
  }

  // Create map pins for driver location
  const mapPins = []
  if (logistics?.acceptedDriver?.currentLat && logistics?.acceptedDriver?.currentLng) {
    mapPins.push({
      id: 'driver',
      name: logistics.acceptedDriver.name,
      lat: logistics.acceptedDriver.currentLat,
      lng: logistics.acceptedDriver.currentLng,
      produce: [logistics.acceptedDriver.vehicleType, logistics.acceptedDriver.plateNumber],
    })
  }
  // Add pickup and dropoff markers
  if (logistics) {
    mapPins.push({
      id: 'pickup',
      name: 'Pickup Location',
      lat: logistics.pickupLat,
      lng: logistics.pickupLng,
      produce: [logistics.pickupAddress],
    })
    mapPins.push({
      id: 'dropoff',
      name: 'Delivery Location',
      lat: logistics.dropoffLat,
      lng: logistics.dropoffLng,
      produce: [logistics.dropoffAddress],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#D4A017', borderTopColor: 'transparent' }} />
          <p style={{ color: '#8B4513', fontWeight: 600 }}>Loading tracking info...</p>
        </div>
      </div>
    )
  }

  if (error || !logistics) {
    return (
      <div className="p-6">
        <GoteraCard>
          <div className="text-center py-8">
            <p className="text-lg font-semibold" style={{ color: '#8B4513' }}>{error || 'Tracking not available'}</p>
            <button 
              onClick={() => router.back()} 
              className="mt-4 px-4 py-2 rounded-lg font-semibold"
              style={{ background: '#D4A017', color: '#1A1A2E' }}
            >
              Go Back
            </button>
          </div>
        </GoteraCard>
      </div>
    )
  }

  const currentStep = getStatusIndex(logistics.status)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Live Tracking</p>
          <h1 className="text-2xl font-bold" style={{ color: '#3d2914' }}>Track Your Delivery</h1>
        </div>
        <button 
          onClick={() => router.back()} 
          className="text-sm font-medium hover:underline"
          style={{ color: '#8B4513' }}
        >
          Back to Order
        </button>
      </div>

      {/* Status Progress Bar */}
      <GoteraCard>
        <div className="py-4">
          <div className="flex justify-between relative">
            {/* Progress line */}
            <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 z-0">
              <div 
                className="h-full transition-all duration-500" 
                style={{ 
                  background: '#2d6a4f', 
                  width: `${Math.max(0, (currentStep / (STATUS_STEPS.length - 1)) * 100)}%` 
                }} 
              />
            </div>
            
            {STATUS_STEPS.map((step, index) => (
              <div key={step} className="flex flex-col items-center z-10">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  style={{ 
                    background: index <= currentStep ? '#2d6a4f' : '#e5e5e5',
                    color: index <= currentStep ? '#fff' : '#666'
                  }}
                >
                  {index <= currentStep ? '✓' : index + 1}
                </div>
                <p className="mt-2 text-xs font-medium text-center" style={{ color: index <= currentStep ? '#2d6a4f' : '#666' }}>
                  {step.replace('_', ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GoteraCard>

      {/* Map */}
      <div className="rounded-xl overflow-hidden">
        <GoteraMap farmers={mapPins} />
      </div>

      {/* Driver Info */}
      {logistics.acceptedDriver ? (
        <GoteraCard>
          <h3 className="font-semibold mb-4" style={{ color: '#3d2914' }}>Your Driver</h3>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#2d6a4f' }}>
                <span className="text-xl font-bold text-white">
                  {logistics.acceptedDriver.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: '#3d2914' }}>{logistics.acceptedDriver.name}</p>
                <p className="text-sm" style={{ color: '#8B4513' }}>{logistics.acceptedDriver.vehicleType}</p>
                <p className="text-xs" style={{ color: '#666' }}>{logistics.acceptedDriver.plateNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold" style={{ color: '#D4A017' }}>{logistics.acceptedDriver.rating.toFixed(1)} Rating</p>
              <a 
                href={`tel:${logistics.acceptedDriver.phone}`}
                className="mt-2 inline-block px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ background: '#2d6a4f', color: '#fff' }}
              >
                Call Driver
              </a>
            </div>
          </div>
        </GoteraCard>
      ) : (
        <GoteraCard>
          <div className="text-center py-4">
            <p style={{ color: '#8B4513' }}>
              {logistics.status === 'SEARCHING' 
                ? 'Looking for a driver...' 
                : 'Driver information will appear here once assigned.'}
            </p>
          </div>
        </GoteraCard>
      )}

      {/* Delivery Details */}
      <GoteraCard>
        <h3 className="font-semibold mb-4" style={{ color: '#3d2914' }}>Delivery Details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Pickup Location</p>
            <p className="font-medium" style={{ color: '#3d2914' }}>{logistics.pickupAddress}</p>
          </div>
          <div>
            <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Delivery Location</p>
            <p className="font-medium" style={{ color: '#3d2914' }}>{logistics.dropoffAddress}</p>
          </div>
        </div>
      </GoteraCard>
    </div>
  )
}
