'use client'

import { Marker } from 'mapbox-gl'
import { MouseEvent, useEffect, useRef } from 'react'
import { Flight } from '../actions/get-flights'
import { PlaneMarker } from '../assets/plane-marker'
import { useMap } from '../hooks/use-map'
import { PlaneTrack } from './flight-track'
import { mapClickSubscribable } from './map'

/** Based on https://gist.github.com/chriswhong/8977c0d4e869e9eaf06b4e9fda80f3ab */
class ClickableMarker extends Marker {
  _handleClick?: (e: MouseEvent<HTMLDivElement, MouseEvent>) => void

  // new method onClick, sets _handleClick to a function you pass in
  onClick(handleClick: (e: MouseEvent<HTMLDivElement, MouseEvent>) => void) {
    this._handleClick = handleClick

    return this
  }

  // the existing _onMapClick was there to trigger a popup
  // but we are hijacking it to run a function we define
  _onMapClick(e: any) {
    const targetElement = e.originalEvent.target
    const element = this._element

    if (
      this._handleClick &&
      (targetElement === element || element.contains(targetElement))
    ) {
      this._handleClick(e.originalEvent)
    }
  }
}

interface PlanesProps {
  color?: string | 'nyan'
  flights: Flight[]
  selectedFlight: Flight | null
  setSelectedFlight: (flight: Flight | null) => void
}

export function Planes({
  flights,
  selectedFlight,
  setSelectedFlight,
}: PlanesProps) {
  const { map } = useMap()
  const planeMarkerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (selectedFlight && selectedFlight.lat && selectedFlight.lon) {
      map.flyTo({
        center: [selectedFlight.lon, selectedFlight.lat],
        duration: 1000,
        zoom: 6,
      })
    }
  }, [selectedFlight, map])

  useEffect(() => {
    const planeMarkerEl = planeMarkerRef.current

    if (!planeMarkerEl) return

    const planeMarkers = flights.map((plane, index) => {
      const planeMarker = new ClickableMarker({
        element: planeMarkerEl.cloneNode(true) as HTMLElement,
        rotation: plane.track,
      }).setLngLat([plane.lon, plane.lat])
      planeMarker.addTo(map)

      planeMarker.onClick((e) => {
        e.preventDefault()

        setSelectedFlight({ ...plane })
      })
      return planeMarker
    })

    const suscriptionId = mapClickSubscribable.addCallback((e) => {
      if (!e.defaultPrevented) {
        setSelectedFlight(null)
      }
    })

    return () => {
      planeMarkers.forEach((marker) => marker.remove())
      mapClickSubscribable.removeCallback(suscriptionId)
    }
  }, [flights, map])

  return (
    <>
      <div className="hidden">
        <div
          id="plane-marker"
          ref={planeMarkerRef}
          className="cursor-pointer text-blue"
        >
          <PlaneMarker />
        </div>
      </div>
      {selectedFlight && (
        <PlaneTrack
          id={selectedFlight.fr24_id}
          timestamp={selectedFlight.timestamp}
          currentLat={selectedFlight.lat}
          currentLon={selectedFlight.lon}
        />
      )}
    </>
  )
}
