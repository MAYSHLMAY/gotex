'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { GoteraCard } from '@/components/ui/GoteraCard'

const GoteraMap = dynamic(() => import('@/components/shared/GoteraMap'), { ssr: false })

interface LogisticsRequest {
  id: string
  orderId: string
  pickupAddress: string
  pickupLat: number
  pickupLng: number
  dropoffAddress: string
  dropoffLat: number
  dropoffLng: number
  weightKg: number
  offeredPriceEtb: number
  requiresRefrigeration: boolean
  status: string
}

interface Driver {
  id: string
  name: string
  phone: string
  vehicleType: string
  plateNumber: string
  capacityKg: number
  isAvailable: boolean
  rating: number
  totalDeliveries: number
}

export default function DriverDashboardPage() {
  const [driver, setDriver] = useState<Driver | null>(null)
  const [requests, setRequests] = useState<LogisticsRequest[]>([])
  const [activeDelivery, setActiveDelivery] = useState<LogisticsRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [updatingLocation, setUpdatingLocation] = useState(false)

  // Fetch driver profile and open requests
  useEffect(() => {
    async function fetchData() {
      try {
        // For demo, we'll use the first available driver or show registration prompt
        const driverRes = await fetch('/api/drivers')
        const driverData = await driverRes.json()
        
        if (driverData.data && driverData.data.length > 0) {
          // Use first driver for demo
          setDriver(driverData.data[0])
        }

        // Fetch open logistics requests
        const requestsRes = await fetch('/api/logistics/requests')
        const requestsData = await requestsRes.json()
        setRequests(requestsData.data || [])
      } catch (error) {
        console.error('[DriverDashboard] Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Check for active delivery
  useEffect(() => {
    if (!driver) return

    const checkActiveDelivery = async () => {
      try {
        // Check all requests for one assigned to this driver
        const res = await fetch('/api/logistics/requests')
        const data = await res.json()
        const active = (data.data || []).find(
          (r: LogisticsRequest) => r.status !== 'SEARCHING' && r.status !== 'DELIVERED'
        )
        // For demo purposes, we'll check if any request is in progress
        if (active) {
          setActiveDelivery(active)
        }
      } catch (error) {
        console.error('[DriverDashboard] Error checking active delivery:', error)
      }
    }
    checkActiveDelivery()
  }, [driver])

  const handleAcceptJob = async (requestId: string) => {
    if (!driver) return
    setAcceptingId(requestId)
    try {
      const res = await fetch('/api/logistics/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, driverId: driver.id }),
      })
      const data = await res.json()
      if (res.ok) {
        setActiveDelivery(data.data)
        setRequests(prev => prev.filter(r => r.id !== requestId))
        setDriver(prev => prev ? { ...prev, isAvailable: false } : null)
      } else {
        alert(data.error || 'Failed to accept job')
      }
    } catch (error) {
      console.error('[DriverDashboard] Error accepting job:', error)
      alert('Failed to accept job')
    } finally {
      setAcceptingId(null)
    }
  }

  const handleUpdateLocation = useCallback(async () => {
    if (!driver) return
    setUpdatingLocation(true)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      })

      const res = await fetch('/api/drivers/location', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driverId: driver.id,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      })

      if (res.ok) {
        alert('Location updated successfully!')
      } else {
        alert('Failed to update location')
      }
    } catch (error) {
      console.error('[DriverDashboard] Location error:', error)
      alert('Could not get your location. Please enable location services.')
    } finally {
      setUpdatingLocation(false)
    }
  }, [driver])

  const handleMarkPickedUp = async () => {
    if (!activeDelivery) return
    try {
      const res = await fetch(`/api/logistics/${activeDelivery.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PICKED_UP' }),
      })
      if (res.ok) {
        setActiveDelivery(prev => prev ? { ...prev, status: 'PICKED_UP' } : null)
      }
    } catch (error) {
      console.error('[DriverDashboard] Error updating status:', error)
    }
  }

  const handleMarkDelivered = async () => {
    if (!activeDelivery) return
    try {
      const res = await fetch(`/api/logistics/${activeDelivery.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DELIVERED' }),
      })
      if (res.ok) {
        setActiveDelivery(null)
        setDriver(prev => prev ? { ...prev, isAvailable: true, totalDeliveries: prev.totalDeliveries + 1 } : null)
      }
    } catch (error) {
      console.error('[DriverDashboard] Error updating status:', error)
    }
  }

  // Convert requests to map pins format
  const mapPins = requests.map(r => ({
    id: r.id,
    name: `${r.weightKg}kg - ${r.offeredPriceEtb} ETB`,
    lat: r.pickupLat,
    lng: r.pickupLng,
    produce: [r.pickupAddress, r.dropoffAddress],
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#D4A017', borderTopColor: 'transparent' }} />
          <p style={{ color: '#8B4513', fontWeight: 600 }}>Loading driver dashboard...</p>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="p-6">
        <GoteraCard>
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold" style={{ color: '#3d2914' }}>Driver Registration</h2>
            <p className="mt-2 text-sm" style={{ color: '#8B4513' }}>
              You are not registered as a driver yet. Contact admin to register.
            </p>
          </div>
        </GoteraCard>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Driver Portal</p>
        <h1 className="text-2xl font-bold" style={{ color: '#3d2914' }}>Welcome, {driver.name}</h1>
      </div>

      {/* Driver Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Vehicle</p>
          <p className="mt-1 font-semibold" style={{ color: '#3d2914' }}>{driver.vehicleType}</p>
          <p className="text-xs" style={{ color: '#666' }}>{driver.plateNumber}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Capacity</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#2d6a4f' }}>{driver.capacityKg}kg</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Deliveries</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#D4A017' }}>{driver.totalDeliveries}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Rating</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: '#8B4513' }}>{driver.rating.toFixed(1)}</p>
        </GoteraCard>
      </div>

      {/* Update Location Button */}
      <button
        onClick={handleUpdateLocation}
        disabled={updatingLocation}
        className="px-4 py-2 rounded-lg font-semibold transition-opacity"
        style={{ background: '#2d6a4f', color: '#fff', opacity: updatingLocation ? 0.7 : 1 }}
      >
        {updatingLocation ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
            Updating...
          </>
        ) : (
          'Update My Location'
        )}
      </button>

      {/* Active Delivery Section */}
      {activeDelivery && (
        <div className="rounded-xl p-6" style={{ background: '#2d6a4f20', border: '2px solid #2d6a4f' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#2d6a4f' }}>My Active Delivery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Pickup</p>
              <p className="font-semibold" style={{ color: '#3d2914' }}>{activeDelivery.pickupAddress}</p>
            </div>
            <div>
              <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Dropoff</p>
              <p className="font-semibold" style={{ color: '#3d2914' }}>{activeDelivery.dropoffAddress}</p>
            </div>
            <div>
              <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Weight</p>
              <p className="font-semibold" style={{ color: '#3d2914' }}>{activeDelivery.weightKg}kg</p>
            </div>
            <div>
              <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Payment</p>
              <p className="font-semibold" style={{ color: '#D4A017' }}>{activeDelivery.offeredPriceEtb} ETB</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            {activeDelivery.status === 'ASSIGNED' && (
              <button
                onClick={handleMarkPickedUp}
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ background: '#D4A017', color: '#1A1A2E' }}
              >
                Mark as Picked Up
              </button>
            )}
            {activeDelivery.status === 'PICKED_UP' && (
              <button
                onClick={handleMarkDelivered}
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ background: '#2d6a4f', color: '#fff' }}
              >
                Mark as Delivered
              </button>
            )}
            <span className="px-3 py-2 rounded-lg text-sm font-medium" style={{ background: '#F5F0E8', color: '#8B4513' }}>
              Status: {activeDelivery.status}
            </span>
          </div>
        </div>
      )}

      {/* Map with Open Jobs */}
      {!activeDelivery && (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#3d2914' }}>Available Jobs</h2>
            <GoteraMap farmers={mapPins} />
          </div>

          {/* Job Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.length === 0 ? (
              <GoteraCard>
                <p className="text-center py-4" style={{ color: '#8B4513' }}>No delivery jobs available right now.</p>
              </GoteraCard>
            ) : (
              requests.map(request => (
                <GoteraCard key={request.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Pickup</p>
                        <p className="text-sm font-medium" style={{ color: '#3d2914' }}>{request.pickupAddress}</p>
                      </div>
                      <span className="text-lg font-bold" style={{ color: '#D4A017' }}>{request.offeredPriceEtb} ETB</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase" style={{ color: '#8B4513' }}>Dropoff</p>
                      <p className="text-sm font-medium" style={{ color: '#3d2914' }}>{request.dropoffAddress}</p>
                    </div>
                    <div className="flex gap-4 text-xs" style={{ color: '#666' }}>
                      <span>{request.weightKg}kg</span>
                      {request.requiresRefrigeration && <span style={{ color: '#0ea5e9' }}>Refrigerated</span>}
                    </div>
                    <button
                      onClick={() => handleAcceptJob(request.id)}
                      disabled={acceptingId === request.id || !driver.isAvailable}
                      className="w-full mt-2 px-4 py-2 rounded-lg font-semibold transition-opacity"
                      style={{ 
                        background: '#D4A017', 
                        color: '#1A1A2E',
                        opacity: acceptingId === request.id || !driver.isAvailable ? 0.7 : 1 
                      }}
                    >
                      {acceptingId === request.id ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2" style={{ borderColor: 'currentColor', borderTopColor: 'transparent' }} />
                          Accepting...
                        </>
                      ) : (
                        'Accept Job'
                      )}
                    </button>
                  </div>
                </GoteraCard>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
