"use client";

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function EthiopianMap({ className = "" }: { className?: string }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [status, setStatus] = useState("Initializing WebGL Map...");

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainer.current) return;

    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [38.7636, 9.0054],
        zoom: 5.5,
        trackResize: true,
      });

      const resizeObserver = new ResizeObserver(() => {
        if (map.current) {
          map.current.resize();
        }
      });

      resizeObserver.observe(mapContainer.current);

      // --- THE CRITICAL FIX FOR FULL SCREEN LOAD ---
      // Force a resize check after the initial render cycle
      setTimeout(() => {
        if (map.current) {
          map.current.resize();
        }
      }, 100);

      map.current.on('load', () => {
        setStatus("Loaded");
        if (map.current) {
          // Force resize one more time on actual load
          map.current.resize();
          new maplibregl.Marker({ color: "#2d6a4f" })
            .setLngLat([38.7636, 9.0054])
            .addTo(map.current);
        }
      });

      map.current.on('error', (e) => {
        console.error("MapLibre Error:", e);
        setStatus("Map Load Failed");
      });

      return () => {
        resizeObserver.disconnect();
        map.current?.remove();
      };

    } catch (err) {
      console.error("Map Initialization Error:", err);
      setStatus("WebGL Error");
    }
  }, []);

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-xl border border-[var(--gotera-earth)]/10 bg-[#f8f9fa] ${className}`}>
      {status !== "Loaded" && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[var(--gotera-mist)] p-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gotera-green)] border-t-transparent mb-2" />
          <p className="text-xs font-mono text-[var(--gotera-earth)]">{status}</p>
        </div>
      )}
      <div ref={mapContainer} className="h-full w-full block" style={{ minHeight: '320px' }} />
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-white/90 p-2 shadow-sm backdrop-blur-sm border border-[var(--gotera-earth)]/10">
        <p className="font-display text-[10px] font-bold text-[var(--gotera-bark)] uppercase tracking-tight">
          Ethiopia Network Hub
        </p>
      </div>
    </div>
  );
}

export default EthiopianMap;