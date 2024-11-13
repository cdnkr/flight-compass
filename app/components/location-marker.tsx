'use client'

import { Marker } from 'mapbox-gl'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useMap } from '../hooks/use-map'
import CircleMarker from '../assets/circle-marker.svg'

export function LocationMarker({
  params,
}: {
  params: { latitude: number; longitude: number }
}) {
  const circleMarkerRef = useRef<HTMLDivElement | null>(null)

  const map = useMap()

  useEffect(() => {
    const circleMarkerEl = circleMarkerRef.current
    if (!circleMarkerEl || !params) return

    const marker = new Marker({
      element: circleMarkerEl.cloneNode(true) as HTMLElement,
    }).setLngLat([params.longitude, params.latitude])

    marker.addTo(map.map)

    return () => {
      marker.remove()
    }
  }, [params])

  return (
    <div className="hidden">
      <div ref={circleMarkerRef} className="relative">
        <div className="marker-pulse-container">
          <div className="marker-pulse"></div>
        </div>
        <Image className="relative" src={CircleMarker} alt="Circle Marker" />
      </div>
    </div>
  )
}
