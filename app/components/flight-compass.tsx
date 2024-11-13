'use client'

import { Flight } from '@/app/actions/get-flights'
import { useEffect, useRef, useState } from 'react'
import {
  calculateBearing,
  getCardinalDirection,
  getDistance,
} from '../utils/geo'

function KeyValueItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="w-full flex flex-row gap-2">
      <span className="text-gray-400 uppercase">{label}</span>
      <span>{value}</span>
    </div>
  )
}

interface Props {
  flights: Flight[]
  selectedFlight: Flight | null
  setSelectedFlight: (flight: Flight | null) => void
  geolocationPermission: string
  position: GeolocationPosition | null
  compassPermission: string
  direction: { degrees: number; cardinal: string } | null
  setDirection: (
    direction: { degrees: number; cardinal: string } | null,
  ) => void
  hasDeviceOrientationSupport: boolean
}

export default function FlightCompass({
  flights,
  selectedFlight,
  setSelectedFlight,
  position,
  direction,
  setDirection,
  hasDeviceOrientationSupport,
}: Props) {
  const [planeInRange, setPlaneInRange] = useState<Flight | null>(null)
  const planeInRangeRef = useRef<HTMLDivElement>(null)

  console.log({ hasDeviceOrientationSupport })

  useEffect(() => {
    if (!position) return

    const planeInRange_ = flights.filter((plane) => {
      const bearing = calculateBearing(
        position.coords.latitude,
        position.coords.longitude,
        plane.lat,
        plane.lon,
      )
      return (
        bearing > (direction?.degrees || 0) - 10 &&
        bearing < (direction?.degrees || 0) + 10
      )
    })
    handlePlaneInRange(planeInRange_[0])
  }, [flights, direction, position])

  function handlePlaneInRange(plane: Flight | null) {
    setPlaneInRange(plane)
    if (plane) showPlaneInRange()
    else hidePlaneInRange()
  }

  function showPlaneInRange() {
    if (!planeInRangeRef?.current) return
    planeInRangeRef.current.classList.remove('opacity-0')
    planeInRangeRef.current.classList.add('opacity-100')
  }

  function hidePlaneInRange() {
    if (!planeInRangeRef?.current) return
    planeInRangeRef.current.classList.add('opacity-0')
    planeInRangeRef.current.classList.remove('opacity-100')
  }

  function handleDirectionChange(e: React.FormEvent<HTMLInputElement>) {
    const newDirection = e.currentTarget.value

    if (isNaN(parseFloat(newDirection))) return

    if (parseFloat(newDirection) < 0 || parseFloat(newDirection) > 360) return

    setDirection({
      degrees: parseFloat(newDirection),
      cardinal: getCardinalDirection(parseFloat(newDirection)),
    })
  }

  return (
    <div className="space-y-4 text-white w-full flex flex-col items-center">
      <div className="h-auto w-[280px] aspect-square relative border border-gray-400 flex items-center justify-center rounded-full border-dashed">
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center">
            <input
              readOnly={hasDeviceOrientationSupport}
              className="w-[123px] text-center text-6xl bg-transparent inline"
              value={direction?.degrees || 0}
              onChange={(e) => handleDirectionChange(e)}
            />
            <p className="text-6xl text-center">°&nbsp;{direction?.cardinal}</p>
          </div>
          {position && (
            <div className="flex gap-2 mt-2">
              <KeyValueItem
                label="Lat"
                value={`${position.coords.latitude.toFixed(2)}`}
              />
              <KeyValueItem
                label="Lon"
                value={`${position.coords.longitude.toFixed(2)}`}
              />
            </div>
          )}
        </div>

        {position &&
          flights.map((plane, i) => {
            const bearing = calculateBearing(
              position.coords.latitude,
              position.coords.longitude,
              plane.lat,
              plane.lon,
            )

            // Calculate distance and normalize it
            // const distance = parseFloat(getDistance(
            //     position.coords.latitude,
            //     position.coords.longitude,
            //     plane.lat,
            //     plane.lon
            // ));
            // const maxDistance = 250; // Maximum distance in km
            // const normalizedDistance = Math.min(distance / maxDistance, 1);

            // Calculate position on the circle, scaling radius by distance
            const maxRadius = 140 // Maximum radius (edge of circle)
            const scaledRadius = maxRadius
            const angleInRadians =
              ((bearing - (direction?.degrees || 0)) * Math.PI) / 180
            const x = scaledRadius * Math.sin(angleInRadians)
            const y = -scaledRadius * Math.cos(angleInRadians)

            return (
              <div
                key={i}
                onClick={() => handlePlaneInRange(plane)}
                className={`absolute w-5 h-5 bg-blue rounded-full z-1 transition-opacity duration-300 ${planeInRange?.fr24_id === plane.fr24_id ? 'opacity-100' : 'opacity-50'}`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
              />
            )
          })}
      </div>

      <div className="h-auto w-full relative flex flex-col items-center justify-center shrink-0">
        <div
          ref={planeInRangeRef}
          className={`w-full p-2 transition-opacity duration-300 opacity-0`}
        >
          {planeInRange && position && (
            <div className="relative w-full p-4 text-white bg-black rounded-md border border-gray-400">
              <div className="flex flex-col w-full justify-between gap-4 items-end">
                <div className="flex w-full flex-col gap-4">
                  <p className="leading-none text-lg font-bold text-left">
                    {planeInRange.callsign}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    <KeyValueItem
                      label="Org"
                      value={`${planeInRange.orig_iata}`}
                    />
                    <KeyValueItem
                      label="Dest"
                      value={`${planeInRange.dest_iata}`}
                    />
                    <KeyValueItem label="Alt" value={`${planeInRange.alt}ft`} />
                    <KeyValueItem
                      label="Distance"
                      value={`${getDistance(position.coords.latitude, position.coords.longitude, planeInRange.lat, planeInRange.lon)}km`}
                    />
                    <KeyValueItem
                      label="Gspeed"
                      value={`${planeInRange.gspeed}kts`}
                    />
                    <KeyValueItem
                      label="Vspeed"
                      value={`${planeInRange.vspeed}fpm`}
                    />
                    <KeyValueItem
                      label="ETA"
                      value={`${new Date(planeInRange.eta).toLocaleTimeString()}`}
                    />
                    <KeyValueItem label="Type" value={`${planeInRange.type}`} />
                    <KeyValueItem label="Reg" value={`${planeInRange.reg}`} />
                    <KeyValueItem
                      label="Airline"
                      value={`${planeInRange.operating_as}`}
                    />
                  </div>
                </div>
                <div
                  onClick={() => setSelectedFlight(planeInRange)}
                  className="p-2 w-full cursor-pointer block bg-blue leading-none text-center uppercase text-sm font-mono"
                >
                  View flight
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
