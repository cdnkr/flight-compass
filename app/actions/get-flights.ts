'use server'

import { MOCK_FLIGHTS_1 } from '../data/mock-flights'
import { getBounds } from '../utils/geo'

export async function getFlights(params: {
  latitude: number
  longitude: number
  radiusKM: number
}) {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA) return MOCK_FLIGHTS_1

  const { latitude, longitude, radiusKM } = params

  const baseUrl =
    'https://fr24api.flightradar24.com/api/live/flight-positions/full'

  const query = new URLSearchParams({
    bounds: getBounds(latitude, longitude, radiusKM), // show planes within 200km of airport
    altitude_ranges: '100-60000', // show flying planes only
    categories: 'P,C', // show passenger and cargo planes only
  })

  const response = await fetch(`${baseUrl}?${query}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Version': 'v1',
      Authorization: `Bearer ${process.env.FLIGHT_RADAR_TOKEN}`,
    },
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch plane details: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()

  console.log(data.data)

  return data.data as Flight[]
}

export type Flight = {
  fr24_id: string
  flight: string
  callsign: string
  lat: number
  lon: number
  /** Current rotation of the plane, expressed in degrees */
  track: number
  alt: number
  gspeed: number
  vspeed: number
  squawk: string
  timestamp: string
  source: string
  hex: string
  type: string
  reg: string
  painted_as: string
  operating_as: string
  orig_iata: string
  orig_icao: string
  dest_iata: string
  dest_icao: string
  eta: string
}
