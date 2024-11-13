import { getBoundsOfDistance } from 'geolib'

export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const lat1Rad = (lat1 * Math.PI) / 180
  const lat2Rad = (lat2 * Math.PI) / 180
  const lonDiff = ((lon2 - lon1) * Math.PI) / 180

  const y = Math.sin(lonDiff) * Math.cos(lat2Rad)
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lonDiff)

  const bearing = Math.atan2(y, x)
  return ((bearing * 180) / Math.PI + 360) % 360 // Convert to degrees
}

export function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): string {
  const EARTH_RADIUS = 6371 // Earth's radius in kilometers
  const lat1Rad = (lat1 * Math.PI) / 180
  const lat2Rad = (lat2 * Math.PI) / 180
  const latDiff = ((lat2 - lat1) * Math.PI) / 180
  const lonDiff = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(lonDiff / 2) *
      Math.sin(lonDiff / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return (EARTH_RADIUS * c).toFixed(2) // Distance in kilometers
}

export function getCardinalDirection(heading: number) {
  let cardinalDirection
  if (heading >= 337.5 || heading < 22.5) {
    cardinalDirection = 'N'
  } else if (heading >= 22.5 && heading < 67.5) {
    cardinalDirection = 'NE'
  } else if (heading >= 67.5 && heading < 112.5) {
    cardinalDirection = 'E'
  } else if (heading >= 112.5 && heading < 157.5) {
    cardinalDirection = 'SE'
  } else if (heading >= 157.5 && heading < 202.5) {
    cardinalDirection = 'S'
  } else if (heading >= 202.5 && heading < 247.5) {
    cardinalDirection = 'SW'
  } else if (heading >= 247.5 && heading < 292.5) {
    cardinalDirection = 'W'
  } else if (heading >= 292.5 && heading < 337.5) {
    cardinalDirection = 'NW'
  }

  return cardinalDirection
}

export function getBounds(
  latitude: number,
  longitude: number,
  radiusKM: number,
) {
  const radius = radiusKM * 1000 // Convert to meters

  const [southWest, northEast] = getBoundsOfDistance(
    { latitude, longitude },
    radius,
  )

  // Return bounding box format expected by FR24
  return `${northEast.latitude},${southWest.latitude},${southWest.longitude},${northEast.longitude}`
}
