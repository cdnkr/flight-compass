## Flight Compass

This is a simple app that shows the direction of flights around you. Point your device in the direction of a flight to see the details.

Originally cloned and built from [https://github.com/vercel-labs/next-flights](https://github.com/vercel-labs/next-flights)

## Getting started

1. Run `pnpm i` followed by `pnpm dev` to install the dependencies and start the development server.
2. Add your API keys to the `.env` file.

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: The map is generated using [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/).
- `FLIGHT_RADAR_TOKEN`: Real flight tracking data is provided by [flightradar24.com](https://www.flightradar24.com/). It requires a [subscription](https://fr24api.flightradar24.com/subscriptions-and-credits), but also provides a sandbox key.

3. Navigate to [http://localhost:3000](http://localhost:3000).
