/**
 * Normalize boundary input to [[lat, lng], ...] and close the polygon ring.
 */
export function normalizeGeometryRing(input) {
  if (!input) {
    throw new Error('Geometry is required')
  }

  let ring = input

  if (typeof ring === 'object' && !Array.isArray(ring)) {
    if (Array.isArray(ring.coordinates)) {
      const coords = ring.coordinates
      ring = Array.isArray(coords[0]?.[0]) ? coords[0] : coords
    }
  }

  if (!Array.isArray(ring) || ring.length < 3) {
    throw new Error('Geometry must have at least 3 points')
  }

  const normalized = ring.map((point) => {
    if (Array.isArray(point)) {
      return [Number(point[0]), Number(point[1])]
    }
    if (point?.lat !== undefined) {
      return [Number(point.lat), Number(point.lng ?? point.lon)]
    }
    return [Number(point.latitude), Number(point.longitude)]
  })

  // GeoJSON uses [lng, lat]; Cameroon lat is ~1–13, lng ~8–16
  const [a, b] = normalized[0]
  if (Math.abs(a) > 20 && Math.abs(b) <= 20) {
    return closeRing(normalized.map(([lng, lat]) => [lat, lng]))
  }

  return closeRing(normalized)
}

export function closeRing(ring) {
  if (!ring.length) return ring
  const [lat0, lng0] = ring[0]
  const [latN, lngN] = ring[ring.length - 1]
  if (lat0 !== latN || lng0 !== lngN) {
    return [...ring, ring[0]]
  }
  return ring
}

export function ringToWKT(ring) {
  const closed = closeRing(ring)
  const pairs = closed.map(([lat, lng]) => `${lng} ${lat}`).join(', ')
  return `POLYGON((${pairs}))`
}

export function geoJsonToLatLngRing(geoJson) {
  if (!geoJson) return []

  try {
    let parsed = geoJson
    if (typeof geoJson === 'string') {
      parsed = JSON.parse(geoJson)
    } else if (Buffer.isBuffer(geoJson)) {
      return []
    }

    if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
      const [a, b] = parsed[0]
      if (Math.abs(a) > 20 && Math.abs(b) <= 20) {
        return parsed.map(([lng, lat]) => [lat, lng])
      }
      return parsed.map(([lat, lng]) => [lat, lng])
    }

    const ring = parsed?.coordinates?.[0] || []
    if (!ring.length) return []
    return ring.map(([lng, lat]) => [lat, lng])
  } catch {
    return []
  }
}
