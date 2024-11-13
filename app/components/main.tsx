'use client'

import { Flight, getFlights } from '@/app/actions/get-flights'
import useDeviceOrientation from '@/app/hooks/use-device-orientation'
import useGeolocation from '@/app/hooks/use-geolocation'
import { useEffect, useState } from 'react'
import FlightCompass from './flight-compass'
import { Map } from './map'
import { Planes } from './planes'
import { Compass, RefreshCcw, X } from 'lucide-react'

const PLANS_WITHIN_RADIUS_KM = 500

export default function Main() {
  const [flights, setFlights] = useState<Flight[]>([])
  const {
    permission: compassPermission,
    direction,
    setDirection,
    hasSupport: hasDeviceOrientationSupport,
    requestPermission: requestCompassPermission,
  } = useDeviceOrientation()
  const {
    permission: geolocationPermission,
    position,
    requestPermission: requestGeolocationPermission,
  } = useGeolocation()
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  async function fetchPlanes() {
    if (!position) return

    const fetchedPlanes = await getFlights({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      radiusKM: PLANS_WITHIN_RADIUS_KM,
    })

    console.log(fetchedPlanes)
    setLastFetch(new Date())

    if (Array.isArray(fetchedPlanes)) setFlights([...fetchedPlanes])
  }

  useEffect(() => {
    if (
      geolocationPermission === 'granted' &&
      position &&
      flights.length === 0
    ) {
      fetchPlanes()
    }
  }, [geolocationPermission, position])

  async function onRequestPermission() {
    await requestCompassPermission()
    await requestGeolocationPermission()
  }

  return (
    <div className="p-4 max-w-screen-sm mx-auto w-full">
      <div className="mb-2 md:mb-4">
        <h1 className="text-2xl font-bold uppercase">Flight Compass</h1>
        <p className="text-gray-400 text-sm uppercase">
          Planes within {PLANS_WITHIN_RADIUS_KM}km. {process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' && <i className='lowercase text-orange-500'>(using mock data)</i>}
        </p>
        {!hasDeviceOrientationSupport && (
          <div className="mt-2">
            <p className="text-orange-700">
              <b>Your device does not support the orientation API.</b><br />You can manually
              input your heading by clicking on the heading indicator in the
              centre of the compass.
            </p>
          </div>
        )}
      </div>
      {(compassPermission === 'granted') && (
        <>
          <button
            onClick={fetchPlanes}
            className="p-2 w-full mb-2 cursor-pointer flex items-center justify-center gap-2 bg-blue leading-none text-center uppercase text-sm font-mono"
          >
            <RefreshCcw className="size-4" />Refresh Planes
          </button>
          {lastFetch && (
            <p className="text-sm text-gray-400 mb-8">
              Last updated {lastFetch.toLocaleString()}
            </p>
          )}
        </>
      )}
      {compassPermission !== 'granted' ? (
        <button
          onClick={onRequestPermission}
          className="p-2 w-full cursor-pointer flex items-center justify-center gap-2 bg-blue leading-none text-center uppercase text-sm font-mono"
        >
          <Compass className="size-4" />Enable Compass and Location
        </button>
      ) : (
        <FlightCompass
          flights={flights}
          selectedFlight={selectedFlight}
          setSelectedFlight={setSelectedFlight}
          geolocationPermission={geolocationPermission}
          position={position}
          compassPermission={compassPermission}
          direction={direction}
          setDirection={setDirection}
          hasDeviceOrientationSupport={hasDeviceOrientationSupport}
        />
      )}

      {position &&
        position.coords.latitude &&
        position.coords.longitude &&
        selectedFlight && (
          <div className="w-screen h-screen absolute top-0 left-0">
            <div
              className="absolute top-2 right-2 h-10 w-10 cursor-pointer flex items-center justify-center z-10 bg-gray-200 font-bold text-xl rounded-full"
              onClick={() => setSelectedFlight(null)}
            >
              <X className="size-7" stroke="black" />
            </div>
            <Map
              params={{
                latitude: position?.coords.latitude,
                longitude: position?.coords.longitude,
              }}
            >
              <Planes
                color="blue"
                flights={flights}
                selectedFlight={selectedFlight}
                setSelectedFlight={setSelectedFlight}
              />
            </Map>
          </div>
        )}
    </div>
  )
}
