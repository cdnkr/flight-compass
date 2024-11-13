import { useState, useEffect } from 'react'

type GeolocationHookReturn = {
  position: GeolocationPosition | null
  permission: 'granted' | 'denied' | 'prompt'
  error: string | null
  requestPermission: () => Promise<void>
}

export default function useGeolocation(): GeolocationHookReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null)
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>(
    'prompt',
  )
  const [error, setError] = useState<string | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)

  // Cleanup function for watchPosition
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const requestPermission = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    try {
      // Request initial position to trigger permission prompt
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPermission('granted')
            setPosition(position)
            setError(null)
            resolve()
          },
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                setPermission('denied')
                setError('Location permission denied')
                break
              case error.POSITION_UNAVAILABLE:
                setError('Location information is unavailable')
                break
              case error.TIMEOUT:
                setError('Location request timed out')
                break
              default:
                setError('An unknown error occurred')
            }
            reject(error)
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          },
        )
      })

      // If we got here, permission was granted, so start watching position
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setPosition(position)
          setError(null)
        },
        (error) => {
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setPermission('denied')
              setError('Location permission denied')
              break
            case error.POSITION_UNAVAILABLE:
              setError('Location information is unavailable')
              break
            case error.TIMEOUT:
              setError('Location request timed out')
              break
            default:
              setError('An unknown error occurred')
          }
          setPosition(null)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        },
      )

      setWatchId(id)
    } catch (err) {
      setError('Error requesting location permission')
      console.error('Error:', err)
    }
  }

  return {
    position,
    permission,
    error,
    requestPermission,
  }
}
