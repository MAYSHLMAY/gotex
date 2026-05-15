'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
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
  createdAt: string
  distance?: number
  estimatedTime?: number
}

interface Driver {
  id: string
  name: string
  phone: string
  vehicleType: string
  plateNumber: string
  capacityKg: number
  refrigerated: boolean
  isAvailable: boolean
  rating: number
  totalDeliveries: number
  currentLat?: number
  currentLng?: number
}

function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={`${sizes[size]} rounded-full border-3 border-t-transparent animate-spin`} 
         style={{ borderColor: '#D4A017', borderTopColor: 'transparent' }} />
  )
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function calculateSmartScore(request: LogisticsRequest, driver: Driver): number {
  // Smart scoring algorithm considering multiple factors
  let score = 100

  // Distance penalty (closer = higher score)
  if (driver.currentLat && driver.currentLng) {
    const distance = calculateDistance(driver.currentLat, driver.currentLng, request.pickupLat, request.pickupLng)
    score -= distance * 2 // -2 points per km
  }

  // Capacity bonus (right-sized vehicle)
  const capacityRatio = request.weightKg / driver.capacityKg
  if (capacityRatio > 0.5 && capacityRatio <= 1) {
    score += 15 // Good utilization
  } else if (capacityRatio < 0.3) {
    score -= 10 // Over-capacity for the job
  }

  // Refrigeration match
  if (request.requiresRefrigeration && driver.refrigerated) {
    score += 20
  } else if (request.requiresRefrigeration && !driver.refrigerated) {
    score -= 100 // Can't take this job
  }

  // Price/distance ratio (better paying per km = higher score)
  if (driver.currentLat && driver.currentLng) {
    const totalDistance = calculateDistance(driver.currentLat, driver.currentLng, request.pickupLat, request.pickupLng) +
                          calculateDistance(request.pickupLat, request.pickupLng, request.dropoffLat, request.dropoffLng)
    const pricePerKm = request.offeredPriceEtb / Math.max(totalDistance, 1)
    score += Math.min(pricePerKm, 20) // Cap bonus at 20
  }

  // Rating bonus
  score += driver.rating * 2

  return Math.max(0, score)
}

export default function DriverDashboardPage() {
  const { data: session } = useSession()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [requests, setRequests] = useState<LogisticsRequest[]>([])
  const [activeDelivery, setActiveDelivery] = useState<LogisticsRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'tracking' | 'error'>('idle')
  const [lastGpsUpdate, setLastGpsUpdate] = useState<Date | null>(null)
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'job' | 'info' }[]>([])
  const [showNewJobAlert, setShowNewJobAlert] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const prevRequestsRef = useRef<LogisticsRequest[]>([])

  // Fetch driver profile
  useEffect(() => {
    async function fetchData() {
      try {
        const driverRes = await fetch('/api/drivers/me')
        const driverData = await driverRes.json()
        
        if (driverData.data) {
          setDriver(driverData.data)
        } else {
          // Fallback to first driver for demo
          const allDriversRes = await fetch('/api/drivers')
          const allDriversData = await allDriversRes.json()
          if (allDriversData.data?.[0]) {
            setDriver(allDriversData.data[0])
          }
        }
      } catch (error) {
        console.error('Error fetching driver:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Poll for new jobs and check for new notifications
  useEffect(() => {
    if (!driver) return

    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/logistics/requests')
        const data = await res.json()
        const newRequests: LogisticsRequest[] = data.data || []
        
        // Check for new jobs
        const newJobs = newRequests.filter(
          r => !prevRequestsRef.current.find(pr => pr.id === r.id) && r.status === 'SEARCHING'
        )
        
        if (newJobs.length > 0 && prevRequestsRef.current.length > 0) {
          setShowNewJobAlert(true)
          setNotifications(prev => [
            { id: Date.now().toString(), message: `${newJobs.length} new job${newJobs.length > 1 ? 's' : ''} available!`, type: 'job' },
            ...prev.slice(0, 9)
          ])
          
          // Play notification sound if available
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200])
          }
          
          setTimeout(() => setShowNewJobAlert(false), 5000)
        }
        
        // Enrich with distance and scoring if driver has location
        const enrichedRequests = newRequests
          .filter(r => r.status === 'SEARCHING')
          .map(r => {
            if (driver.currentLat && driver.currentLng) {
              const distance = calculateDistance(driver.currentLat, driver.currentLng, r.pickupLat, r.pickupLng)
              const totalRouteDistance = distance + calculateDistance(r.pickupLat, r.pickupLng, r.dropoffLat, r.dropoffLng)
              return {
                ...r,
                distance: Math.round(distance * 10) / 10,
                estimatedTime: Math.round(totalRouteDistance / 30 * 60), // Assume 30 km/h average
                score: calculateSmartScore(r, driver)
              }
            }
            return r
          })
          .sort((a, b) => ((b as LogisticsRequest & { score?: number }).score || 0) - ((a as LogisticsRequest & { score?: number }).score || 0))
        
        prevRequestsRef.current = newRequests
        setRequests(enrichedRequests)
        
        // Check for active delivery
        const active = newRequests.find(r => 
          r.status !== 'SEARCHING' && r.status !== 'DELIVERED'
        )
        if (active) {
          setActiveDelivery(active)
        }
      } catch (error) {
        console.error('Error fetching requests:', error)
      }
    }

    fetchRequests()
    const interval = setInterval(fetchRequests, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [driver])

  // GPS tracking
  const startGpsTracking = useCallback(() => {
    if (!navigator.geolocation || !driver) return

    setGpsStatus('tracking')

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        setLastGpsUpdate(new Date())

        // Update driver location on server
        try {
          await fetch('/api/drivers/location', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              driverId: driver.id,
              lat: latitude,
              lng: longitude,
              accuracy
            }),
          })
          
          setDriver(prev => prev ? { ...prev, currentLat: latitude, currentLng: longitude } : null)
        } catch (error) {
          console.error('Failed to update location:', error)
        }
      },
      (error) => {
        console.error('GPS error:', error)
        setGpsStatus('error')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 30000
      }
    )
  }, [driver])

  const stopGpsTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setGpsStatus('idle')
  }, [])

  // Auto-start GPS when there's an active delivery
  useEffect(() => {
    if (activeDelivery && gpsStatus === 'idle') {
      startGpsTracking()
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [activeDelivery, gpsStatus, startGpsTracking])

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
        setNotifications(prev => [
          { id: Date.now().toString(), message: 'Job accepted! Starting GPS tracking...', type: 'info' },
          ...prev.slice(0, 9)
        ])
        startGpsTracking()
      } else {
        setNotifications(prev => [
          { id: Date.now().toString(), message: data.error || 'Failed to accept job', type: 'info' },
          ...prev.slice(0, 9)
        ])
      }
    } catch (error) {
      console.error('Error accepting job:', error)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleUpdateStatus = async (newStatus: 'PICKED_UP' | 'DELIVERED') => {
    if (!activeDelivery) return
    
    try {
      const res = await fetch(`/api/logistics/${activeDelivery.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (res.ok) {
        if (newStatus === 'DELIVERED') {
          setActiveDelivery(null)
          setDriver(prev => prev ? { 
            ...prev, 
            isAvailable: true, 
            totalDeliveries: prev.totalDeliveries + 1 
          } : null)
          stopGpsTracking()
          setNotifications(prev => [
            { id: Date.now().toString(), message: 'Delivery completed! Great job!', type: 'info' },
            ...prev.slice(0, 9)
          ])
        } else {
          setActiveDelivery(prev => prev ? { ...prev, status: newStatus } : null)
          setNotifications(prev => [
            { id: Date.now().toString(), message: 'Status updated to: ' + newStatus, type: 'info' },
            ...prev.slice(0, 9)
          ])
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleToggleAvailability = async () => {
    if (!driver) return
    
    try {
      const res = await fetch('/api/drivers/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driver.id, isAvailable: !driver.isAvailable }),
      })
      
      if (res.ok) {
        const newStatus = !driver.isAvailable
        setDriver(prev => prev ? { ...prev, isAvailable: newStatus } : null)
        
        if (newStatus) {
          startGpsTracking()
          setNotifications(prev => [
            { id: Date.now().toString(), message: 'You are now online! Looking for jobs...', type: 'info' },
            ...prev.slice(0, 9)
          ])
        } else {
          stopGpsTracking()
          setNotifications(prev => [
            { id: Date.now().toString(), message: 'You are now offline.', type: 'info' },
            ...prev.slice(0, 9)
          ])
        }
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
    }
  }

  // Map pins for available jobs
  const mapPins = requests.map(r => ({
    id: r.id,
    name: `${r.weightKg}kg - ${r.offeredPriceEtb} ETB`,
    lat: r.pickupLat,
    lng: r.pickupLng,
    produce: [r.pickupAddress],
  }))

  // Add driver location to map if available
  if (driver?.currentLat && driver?.currentLng) {
    mapPins.push({
      id: 'driver-location',
      name: 'Your Location',
      lat: driver.currentLat,
      lng: driver.currentLng,
      produce: ['Driver'],
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="font-semibold" style={{ color: '#8B4513' }}>Loading driver dashboard...</p>
        </div>
      </div>
    )
  }

  if (!driver) {
    return (
      <div className="p-6">
        <GoteraCard>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#D4A01720' }}>
              <svg className="w-8 h-8" style={{ color: '#D4A017' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold" style={{ color: '#3d2914' }}>Driver Registration Required</h2>
            <p className="mt-2 text-sm max-w-md mx-auto" style={{ color: '#8B4513' }}>
              You are not registered as a driver yet. Please contact the Gotera admin team to register your vehicle and start accepting deliveries.
            </p>
            <a href="mailto:drivers@gotera.et" className="btn-primary mt-6 inline-flex">
              Contact Admin
            </a>
          </div>
        </GoteraCard>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 pb-32">
      {/* New Job Alert */}
      {showNewJobAlert && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-bounce">
          <div className="mx-auto max-w-md rounded-xl p-4 shadow-lg" style={{ background: '#2d6a4f', color: '#fff' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#ffffff30' }}>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">New Jobs Available!</p>
                <p className="text-sm opacity-90">Check the list below</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Driver Portal</p>
          <h1 className="text-2xl font-bold" style={{ color: '#3d2914' }}>Welcome, {driver.name}</h1>
        </div>
        
        {/* Online/Offline Toggle */}
        <button
          onClick={handleToggleAvailability}
          disabled={!!activeDelivery}
          className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
            activeDelivery ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ 
            background: driver.isAvailable ? '#2d6a4f' : '#8B4513',
            color: '#fff'
          }}
        >
          <span className={`w-3 h-3 rounded-full ${driver.isAvailable ? 'animate-pulse' : ''}`} 
                style={{ background: driver.isAvailable ? '#4ade80' : '#ef4444' }} />
          {driver.isAvailable ? 'Online' : 'Offline'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <GoteraCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Vehicle</p>
          <p className="mt-1 font-semibold text-sm" style={{ color: '#3d2914' }}>{driver.vehicleType}</p>
          <p className="text-xs mt-0.5" style={{ color: '#666' }}>{driver.plateNumber}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Capacity</p>
          <p className="mt-1 text-xl font-bold" style={{ color: '#2d6a4f' }}>{driver.capacityKg}kg</p>
          {driver.refrigerated && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#0ea5e920', color: '#0ea5e9' }}>Refrigerated</span>}
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Deliveries</p>
          <p className="mt-1 text-xl font-bold" style={{ color: '#D4A017' }}>{driver.totalDeliveries}</p>
        </GoteraCard>
        <GoteraCard>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: '#8B4513' }}>Rating</p>
          <p className="mt-1 text-xl font-bold flex items-center gap-1" style={{ color: '#8B4513' }}>
            {driver.rating.toFixed(1)}
            <svg className="w-4 h-4" style={{ color: '#D4A017' }} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </p>
        </GoteraCard>
      </div>

      {/* GPS Status */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: gpsStatus === 'tracking' ? '#2d6a4f15' : '#8B451315' }}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${gpsStatus === 'tracking' ? 'animate-pulse' : ''}`}
               style={{ background: gpsStatus === 'tracking' ? '#2d6a4f' : gpsStatus === 'error' ? '#ef4444' : '#8B4513' }}>
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#3d2914' }}>
              {gpsStatus === 'tracking' ? 'GPS Active' : gpsStatus === 'error' ? 'GPS Error' : 'GPS Inactive'}
            </p>
            {lastGpsUpdate && (
              <p className="text-xs" style={{ color: '#8B4513' }}>
                Last update: {lastGpsUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        
        {gpsStatus !== 'tracking' && (
          <button
            onClick={startGpsTracking}
            className="px-4 py-2 rounded-lg font-semibold text-sm"
            style={{ background: '#2d6a4f', color: '#fff' }}
          >
            Start Tracking
          </button>
        )}
      </div>

      {/* Active Delivery */}
      {activeDelivery && (
        <div className="rounded-xl p-5 space-y-4" style={{ background: '#2d6a4f15', border: '2px solid #2d6a4f' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: '#2d6a4f' }}>Active Delivery</h2>
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#D4A017', color: '#1A1A2E' }}>
              {activeDelivery.status}
            </span>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-3 rounded-lg" style={{ background: '#fff' }}>
              <p className="text-xs uppercase font-semibold mb-1" style={{ color: '#8B4513' }}>Pickup</p>
              <p className="font-medium text-sm" style={{ color: '#3d2914' }}>{activeDelivery.pickupAddress}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: '#fff' }}>
              <p className="text-xs uppercase font-semibold mb-1" style={{ color: '#8B4513' }}>Dropoff</p>
              <p className="font-medium text-sm" style={{ color: '#3d2914' }}>{activeDelivery.dropoffAddress}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="px-3 py-1 rounded-lg" style={{ background: '#fff', color: '#3d2914' }}>
              {activeDelivery.weightKg}kg
            </span>
            <span className="font-bold" style={{ color: '#D4A017' }}>
              {activeDelivery.offeredPriceEtb} ETB
            </span>
            {activeDelivery.requiresRefrigeration && (
              <span className="px-2 py-1 rounded text-xs" style={{ background: '#0ea5e920', color: '#0ea5e9' }}>
                Refrigerated
              </span>
            )}
          </div>
          
          <div className="flex gap-3 pt-2">
            {activeDelivery.status === 'ASSIGNED' && (
              <button
                onClick={() => handleUpdateStatus('PICKED_UP')}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all active:scale-[0.98]"
                style={{ background: '#D4A017', color: '#1A1A2E' }}
              >
                Mark as Picked Up
              </button>
            )}
            {activeDelivery.status === 'PICKED_UP' && (
              <button
                onClick={() => handleUpdateStatus('DELIVERED')}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all active:scale-[0.98]"
                style={{ background: '#2d6a4f', color: '#fff' }}
              >
                Mark as Delivered
              </button>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${activeDelivery.status === 'ASSIGNED' ? activeDelivery.pickupLat : activeDelivery.dropoffLat},${activeDelivery.status === 'ASSIGNED' ? activeDelivery.pickupLng : activeDelivery.dropoffLng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 rounded-lg font-semibold flex items-center gap-2"
              style={{ background: '#1a73e8', color: '#fff' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Navigate
            </a>
          </div>
        </div>
      )}

      {/* Available Jobs */}
      {!activeDelivery && driver.isAvailable && (
        <>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold" style={{ color: '#3d2914' }}>
                Available Jobs ({requests.length})
              </h2>
              <p className="text-xs" style={{ color: '#8B4513' }}>Sorted by best match</p>
            </div>
            
            {requests.length > 0 && (
              <div className="h-64 rounded-xl overflow-hidden mb-4">
                <GoteraMap farmers={mapPins} />
              </div>
            )}
          </div>

          <div className="space-y-3">
            {requests.length === 0 ? (
              <GoteraCard>
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: '#D4A01720' }}>
                    <svg className="w-6 h-6" style={{ color: '#D4A017' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="font-medium" style={{ color: '#3d2914' }}>No delivery jobs right now</p>
                  <p className="text-sm mt-1" style={{ color: '#8B4513' }}>We&apos;ll notify you when new jobs arrive</p>
                </div>
              </GoteraCard>
            ) : (
              requests.map((request, index) => (
                <GoteraCard key={request.id} className={index === 0 ? 'ring-2 ring-[#2d6a4f]' : ''}>
                  {index === 0 && (
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold mb-2" style={{ background: '#2d6a4f', color: '#fff' }}>
                      Best Match
                    </span>
                  )}
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold" style={{ color: '#D4A017' }}>{request.offeredPriceEtb} ETB</span>
                        {request.distance && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#8B451315', color: '#8B4513' }}>
                            {request.distance} km away
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs uppercase font-semibold" style={{ color: '#8B4513' }}>Pickup</p>
                        <p className="text-sm font-medium truncate" style={{ color: '#3d2914' }}>{request.pickupAddress}</p>
                        
                        <p className="text-xs uppercase font-semibold mt-2" style={{ color: '#8B4513' }}>Dropoff</p>
                        <p className="text-sm font-medium truncate" style={{ color: '#3d2914' }}>{request.dropoffAddress}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#F5F0E8', color: '#3d2914' }}>
                          {request.weightKg}kg
                        </span>
                        {request.estimatedTime && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#F5F0E8', color: '#3d2914' }}>
                            ~{request.estimatedTime} min
                          </span>
                        )}
                        {request.requiresRefrigeration && (
                          <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#0ea5e920', color: '#0ea5e9' }}>
                            Refrigerated
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAcceptJob(request.id)}
                      disabled={acceptingId === request.id || !driver.isAvailable}
                      className="shrink-0 px-4 py-3 rounded-lg font-semibold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
                      style={{ background: '#D4A017', color: '#1A1A2E' }}
                    >
                      {acceptingId === request.id ? (
                        <Spinner size="sm" />
                      ) : (
                        'Accept'
                      )}
                    </button>
                  </div>
                </GoteraCard>
              ))
            )}
          </div>
        </>
      )}

      {/* Offline State */}
      {!activeDelivery && !driver.isAvailable && (
        <GoteraCard>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: '#8B451320' }}>
              <svg className="w-8 h-8" style={{ color: '#8B4513' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#3d2914' }}>You&apos;re Offline</h3>
            <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: '#8B4513' }}>
              Toggle to Online to start receiving delivery jobs in your area.
            </p>
          </div>
        </GoteraCard>
      )}

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: '#8B4513' }}>Recent Activity</h3>
          <div className="space-y-2">
            {notifications.slice(0, 5).map(notif => (
              <div key={notif.id} className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ background: '#F5F0E8' }}>
                <span className={`w-2 h-2 rounded-full ${notif.type === 'job' ? 'bg-green-500' : 'bg-blue-500'}`} />
                <span style={{ color: '#3d2914' }}>{notif.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
