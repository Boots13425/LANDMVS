import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { GISMap } from '../../components/maps/GISMap'
import SurveyorService from '../../services/SurveyorService'
import './surveyor.css'

export const SurveyorBoundariesPage = () => {
  const [parcels, setParcels] = useState([])
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [newCoordinates, setNewCoordinates] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadParcels()
  }, [])

  const loadParcels = async () => {
    setLoading(true)
    try {
      const data = await SurveyorService.getParcels()
      setParcels(data)
    } catch {
      setMessage('Failed to load parcels')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectParcel = async (parcelId) => {
    try {
      const detail = await SurveyorService.getParcelDetail(parcelId)
      setSelectedParcel(detail)
      setNewCoordinates(detail.geometry?.length ? detail.geometry : null)
      setMessage('')
    } catch {
      setMessage('Failed to load parcel details')
    }
  }

  const handleSaveBoundary = async () => {
    if (!selectedParcel || !newCoordinates || newCoordinates.length < 3) {
      setMessage('Draw at least 3 boundary points')
      return
    }
    setSaving(true)
    try {
      await SurveyorService.updateBoundary(selectedParcel.id, newCoordinates)
      setMessage('Boundary updated successfully')
      await loadParcels()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update boundary')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="surveyor-boundaries-page">
        <div className="page-header">
          <h1>Draw / Edit Boundaries</h1>
          <p>Select a parcel and redraw its boundary on the map</p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="boundaries-layout">
          <aside className="parcel-picker">
            <h3>Parcels</h3>
            {loading ? <p>Loading...</p> : (
              <ul>
                {parcels.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className={selectedParcel?.id === p.id ? 'active' : ''}
                      onClick={() => handleSelectParcel(p.id)}
                    >
                      {p.name} — {p.status}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <div className="map-panel">
            {selectedParcel ? (
              <>
                <div className="toolbar">
                  <strong>{selectedParcel.name}</strong>
                  <button type="button" onClick={() => setIsDrawing(!isDrawing)}>
                    {isDrawing ? 'Stop Drawing' : 'Redraw Boundary'}
                  </button>
                  <button type="button" className="submit-btn" onClick={handleSaveBoundary} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Boundary'}
                  </button>
                </div>
                <GISMap
                  height="550px"
                  zoom={14}
                  parcels={selectedParcel ? [selectedParcel] : parcels}
                  highlightPositions={newCoordinates}
                  isDrawingMode={isDrawing}
                  drawnPositions={newCoordinates}
                  fitBounds
                  onDraw={(coords) => {
                    setNewCoordinates(coords)
                    setIsDrawing(false)
                  }}
                />
              </>
            ) : (
              <p className="empty-hint">Select a parcel from the list to edit its boundary.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
