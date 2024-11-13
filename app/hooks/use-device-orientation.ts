'use client'

import { useEffect, useState } from 'react'
import { getCardinalDirection } from '../utils/geo'

export default function useDeviceOrientation() {
  const [permission, setPermission] = useState('unknown')
  const [direction, setDirection] = useState<{
    degrees: number
    cardinal: string
  } | null>(null)
  const [hasSupport, setHasSupport] = useState(true)

  // Function to check device orientation support
  const checkSupport = () => {
    if (typeof window === 'undefined') return false

    if (!window.DeviceOrientationEvent) {
      alert('Your device does not support compass functionality.')
      setHasSupport(false)
      setDirection({ degrees: 0, cardinal: 'N' })
      return false
    }
    return true
  }

  // Function to handle device motion/orientation data
  const handleOrientation = (event) => {
    let heading = 0

    console.log({ orientationEvent: event })
    // For iOS devices
    if (event?.webkitCompassHeading) {
      heading = event.webkitCompassHeading
    }
    // For Android devices
    else if (event.alpha !== null) {
      // Convert alpha angle to compass heading
      // Alpha starts at 0° pointing North and increases clockwise
      // Compass heading starts at 0° pointing North and increases clockwise
      heading = 360 - event.alpha
    } else {
      setHasSupport(false)
      setDirection({ degrees: 0, cardinal: 'N' })
    }

    if (heading !== undefined) {
      let cardinalDirection = getCardinalDirection(heading)

      setDirection({
        degrees: Math.round(heading),
        cardinal: cardinalDirection,
      })
    }
  }

  // Function to request permission
  const requestPermission = async () => {
    if (!checkSupport()) return

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      // @ts-expect-error requestPermission is supported in iOS
      typeof DeviceOrientationEvent.requestPermission === 'function'
    ) {
      try {
        // @ts-expect-error requestPermission is supported in iOS
        const response = await DeviceOrientationEvent.requestPermission()
        setPermission(response)

        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation)
        }
      } catch (error) {
        console.error('Error requesting orientation permission:', error)
        setPermission('error')
      }
    } else {
      // For non-iOS devices or older browsers
      window.addEventListener('deviceorientation', handleOrientation)
      setPermission('granted')
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  useEffect(() => {
    console.log({ hasSupport })
  }, [hasSupport])

  return {
    permission,
    direction,
    setDirection,
    requestPermission,
    hasSupport,
  }
}
