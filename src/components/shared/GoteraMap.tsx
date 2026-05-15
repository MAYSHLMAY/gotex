'use client'
import { useEffect, useRef, useState } from 'react'

interface FarmerPin {
  id: string
  name: string
  lat: number
  lng: number
  produce: string[]
}

// Inject Leaflet CSS via CDN (avoids Next.js module resolution issues)
function injectLeafletCSS() {
  if (typeof document === 'undefined') return
  const LEAFLET_CSS_ID = 'leaflet-css-cdn'
  if (document.getElementById(LEAFLET_CSS_ID)) return
  const link = document.createElement('link')
  link.id = LEAFLET_CSS_ID
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
  link.crossOrigin = ''
  document.head.appendChild(link)
}

export default function GoteraMap({ farmers, onFarmerClick }: { farmers: FarmerPin[], onFarmerClick?: (id: string) => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const initMap = async () => {
      try {
        // Inject CSS first
        injectLeafletCSS()
        
        // Dynamically import Leaflet
        const L = (await import('leaflet')).default

        mapInstance.current = L.map(mapRef.current!, { center: [9.0257, 38.7468], zoom: 7 })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current)

        const icon = L.divIcon({
          html: `<div style="background:#D4A017;width:14px;height:14px;border-radius:50%;border:2px solid #8B4513;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>`,
          className: '',
          iconSize: [18, 18],
        })

        farmers.forEach(f => {
          L.marker([f.lat, f.lng], { icon })
            .addTo(mapInstance.current)
            .bindPopup(`
              <div style="font-family:sans-serif;min-width:140px">
                <strong style="color:#8B4513">${f.name}</strong><br/>
                <small style="color:#555">${f.produce.slice(0,3).join(', ')}</small><br/>
                <button onclick="window.__goteraClick('${f.id}')"
                  style="margin-top:8px;background:#D4A017;color:#1A1A2E;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:12px;width:100%">
                  View Profile →
                </button>
              </div>
            `)
        })

        if (onFarmerClick) {
          (window as any).__goteraClick = onFarmerClick
        }
      } catch (err) {
        console.error('[GoteraMap] Failed to initialize map:', err)
        setMapError('Map failed to load. Please refresh the page.')
      }
    }

    initMap()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [farmers, onFarmerClick])

  // Fallback UI if map fails
  if (mapError) {
    return (
      <div 
        style={{ 
          height: '450px', 
          width: '100%', 
          borderRadius: '12px', 
          background: '#F5F0E8',
          border: '2px dashed #D4A017',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '48px' }}>🗺️</div>
        <p style={{ color: '#8B4513', fontWeight: 600 }}>{mapError}</p>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Showing {farmers.length} farmers across Ethiopia
        </p>
      </div>
    )
  }

  return (
    <div ref={mapRef} style={{ height: '450px', width: '100%', borderRadius: '12px', zIndex: 0 }} />
  )
}
