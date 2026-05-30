import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, Polygon, Polyline, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './GISMap.css'
import { toLeafletPositions, getBoundsFromParcels, getMapCenter } from '../../utils/geometryUtils'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const MapFitBounds = ({ bounds }) => {
  const map = useMap()

  useEffect(() => {
    if (bounds.length >= 2) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 })
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15)
    }
  }, [bounds, map])

  return null
}

const ClickDrawHandler = ({ isDrawing, points, setPoints, onDrawComplete }) => {
  useMapEvents({
    click(e) {
      if (!isDrawing) return
      setPoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]])
    },
    dblclick(e) {
      if (!isDrawing) return
      e.originalEvent.preventDefault()
      setPoints((prev) => {
        if (prev.length >= 3 && onDrawComplete) {
          onDrawComplete(prev)
        }
        return prev
      })
    }
  })
  return null
}

export const GISMap = ({
  center: centerProp,
  zoom = 12,
  parcels = [],
  drawnPositions = null,
  highlightPositions = null,
  onParcelClick = null,
  onDraw = null,
  isDrawingMode = false,
  fitBounds = true,
  height = '500px'
}) => {
  const [points, setPoints] = useState([])
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

  const displayParcels = useMemo(() => {
    return parcels.filter((p) => toLeafletPositions(p.geometry).length >= 3)
  }, [parcels])

  const allBounds = useMemo(() => {
    const fromParcels = getBoundsFromParcels(displayParcels)
    const fromHighlight = toLeafletPositions(highlightPositions)
    const fromDrawn = toLeafletPositions(drawnPositions)
    return [...fromParcels, ...fromHighlight, ...fromDrawn]
  }, [displayParcels, highlightPositions, drawnPositions])

  const center = centerProp || getMapCenter(displayParcels)

  useEffect(() => {
    if (!isDrawingMode) {
      setPoints([])
    }
  }, [isDrawingMode])

  useEffect(() => {
    if (drawnPositions?.length) {
      setPoints(drawnPositions)
    }
  }, [drawnPositions])

  const handleFinish = useCallback(() => {
    if (points.length >= 3 && onDraw) {
      onDraw(points)
    }
  }, [points, onDraw])

  const handleClear = useCallback(() => {
    setPoints([])
  }, [])

  const previewLine = points.length >= 2 ? points : []
  const previewPolygon = points.length >= 3 ? points : []
  const highlightRing = toLeafletPositions(highlightPositions)
  const showHighlight =
    highlightRing.length >= 3 &&
    !displayParcels.some(
      (p) => JSON.stringify(toLeafletPositions(p.geometry)) === JSON.stringify(highlightRing)
    )

  return (
    <div className="gis-map-container" style={{ height }}>
      {isDrawingMode && (
        <div className="map-draw-toolbar">
          <span>Click to add points. Double-click or press Finish when done (min 3 points).</span>
          <div className="map-draw-actions">
            <button type="button" onClick={handleFinish} disabled={points.length < 3}>
              Finish ({points.length} pts)
            </button>
            <button type="button" onClick={handleClear} className="secondary">
              Clear
            </button>
          </div>
        </div>
      )}
      <MapContainer
        key={`${center[0]}-${center[1]}-${displayParcels.length}-${allBounds.length}`}
        center={center}
        zoom={zoom}
        style={{ height: isDrawingMode ? 'calc(100% - 48px)' : '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {fitBounds && allBounds.length > 0 && <MapFitBounds bounds={allBounds} />}

        <ClickDrawHandler
          isDrawing={isDrawingMode}
          points={points}
          setPoints={setPoints}
          onDrawComplete={onDraw}
        />

        {displayParcels.map((parcel, index) => {
          const positions = toLeafletPositions(parcel.geometry)
          return (
            <Polygon
              key={parcel.id ?? `parcel-${index}`}
              positions={positions}
              pathOptions={{
                color: colors[index % colors.length],
                weight: 2,
                fillOpacity: 0.35
              }}
              eventHandlers={{ click: () => onParcelClick?.(parcel) }}
            >
              <Popup>
                <div className="parcel-popup">
                  <h4>{parcel.name}</h4>
                  <p><strong>Area:</strong> {parcel.area} m²</p>
                  <p><strong>Status:</strong> {parcel.status}</p>
                </div>
              </Popup>
            </Polygon>
          )
        })}

        {showHighlight && (
          <Polygon
            positions={highlightRing}
            pathOptions={{ color: '#2563eb', weight: 3, fillOpacity: 0.25 }}
          />
        )}

        {previewLine.length >= 2 && isDrawingMode && (
          <Polyline positions={previewLine} pathOptions={{ color: '#16a34a', weight: 2, dashArray: '6 4' }} />
        )}

        {previewPolygon.length >= 3 && isDrawingMode && (
          <Polygon positions={previewPolygon} pathOptions={{ color: '#16a34a', weight: 2, fillOpacity: 0.2 }} />
        )}

        {isDrawingMode &&
          points.map((pos, i) => (
            <Marker key={`pt-${i}`} position={pos}>
              <Popup>Point {i + 1}</Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  )
}
