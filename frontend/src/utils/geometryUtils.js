/** Convert backend ring ([lat,lng][] or GeoJSON) to Leaflet [lat,lng][] */
export function toLeafletPositions(geometry) {
  if (!geometry) return []

  if (Array.isArray(geometry)) {
    if (!geometry.length) return []
    const first = geometry[0]
    if (Array.isArray(first)) {
      const [a, b] = first
      if (Math.abs(a) > 20 && Math.abs(b) <= 20) {
        return geometry.map(([lng, lat]) => [lat, lng])
      }
      return geometry.map(([lat, lng]) => [lat, lng])
    }
  }

  if (geometry?.coordinates?.[0]) {
    return geometry.coordinates[0].map(([lng, lat]) => [lat, lng])
  }

  return []
}

export function positionsToApiGeometry(positions) {
  if (!positions?.length) return []
  return positions.map(([lat, lng]) => [lat, lng])
}

/** Flatten parcel geometries into Leaflet bounds [[lat,lng], ...] */
export function getBoundsFromParcels(parcels = []) {
  const bounds = []
  parcels.forEach((parcel) => {
    toLeafletPositions(parcel.geometry).forEach((pos) => bounds.push(pos))
  })
  return bounds
}

/** Center for map from parcels or default Cameroon */
export function getMapCenter(parcels = [], fallback = [3.848, 11.5021]) {
  const bounds = getBoundsFromParcels(parcels)
  if (bounds.length === 0) return fallback
  const latSum = bounds.reduce((s, [lat]) => s + lat, 0)
  const lngSum = bounds.reduce((s, [, lng]) => s + lng, 0)
  return [latSum / bounds.length, lngSum / bounds.length]
}
