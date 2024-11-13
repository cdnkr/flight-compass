'use client'

import { MapContext, MapType } from '@/app/hooks/use-map'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  MouseEvent,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
// import useCompass from '../hooks/use-device-orientation';
import { subscribable } from '../utils/subscribable'
import { LocationMarker } from './location-marker'

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string

if (!mapboxToken) throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set')

const INITIAL_ZOOM = 6

export const mapClickSubscribable =
  subscribable<(e: MouseEvent<HTMLDivElement>) => void>()

interface MapProviderProps {
  children?: ReactNode
  mapContainerRef: React.RefObject<HTMLDivElement>
  params: { latitude: number; longitude: number }
}

export function MapProvider({
  children,
  mapContainerRef,
  params,
}: MapProviderProps) {
  const mapRef = useRef<MapType | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  // const { direction, permission, requestPermission } = useCompass()

  useEffect(() => {
    if (!mapContainerRef.current) return
    const center = { latitude: params.latitude, longitude: params.longitude }
    mapboxgl.accessToken = mapboxToken
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [center.longitude, center.latitude],
      zoom: INITIAL_ZOOM,
      attributionControl: false,
      logoPosition: 'bottom-right',
      style: 'mapbox://styles/mapbox/dark-v11',
    })

    mapRef.current = map
    setIsMapReady(true)

    return () => {
      if (map) map.remove()
    }
  }, [])

  // useEffect(() => {
  //   if (permission !== 'granted') return;
  //   mapRef.current?.setBearing(direction?.degrees ?? 0);
  // }, [direction, permission]);

  if (!isMapReady) return null

  return (
    <>
      {/* <p onClick={requestPermission} className='text-white absolute top-0 left-0 z-[1001] bg-red-500'>{direction?.degrees || 'none'}</p> */}

      <div className="z-[1000] relative">
        <MapContext.Provider value={{ map: mapRef.current! }}>
          {children}
        </MapContext.Provider>
      </div>
    </>
  )
}

interface MapProps {
  params: { latitude: number; longitude: number }
}

export function Map({ children, params }: PropsWithChildren<MapProps>) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    mapClickSubscribable.runCallbacks(e)
  }, [])

  return (
    <div className="w-screen h-screen" onClick={handleClick}>
      <div className="relative w-full h-full">
        <div
          id="map-container"
          ref={mapContainerRef}
          className="absolute inset-0 h-full w-full"
        />
        <MapProvider mapContainerRef={mapContainerRef} params={params}>
          <LocationMarker params={params} />
          {children}
        </MapProvider>
      </div>
    </div>
  )
}
