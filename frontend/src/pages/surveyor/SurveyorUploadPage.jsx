import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { GISMap } from '../../components/maps/GISMap'
import SurveyorService from '../../services/SurveyorService'
import './surveyor.css'
import '../landowner/landowner.css'

export const SurveyorUploadPage = () => {
  const navigate = useNavigate()
  const [landowners, setLandowners] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    area: '',
    description: '',
    ownerId: '',
    coordinates: null
  })
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    SurveyorService.getLandowners()
      .then(setLandowners)
      .catch(() => setMessage('Could not load landowners list'))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDrawing = (coordinates) => {
    setFormData((prev) => ({ ...prev, coordinates }))
    setIsDrawing(false)
    setMessage('Boundaries captured successfully')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.coordinates || formData.coordinates.length < 3) {
      setMessage('Error: Draw parcel boundaries on the map (at least 3 points)')
      return
    }
    if (!formData.ownerId) {
      setMessage('Error: Select a land owner')
      return
    }

    setLoading(true)
    setMessage('')
    try {
      await SurveyorService.uploadParcel({
        name: formData.name,
        location: formData.location,
        area: parseFloat(formData.area),
        description: formData.description,
        ownerId: parseInt(formData.ownerId, 10),
        geometry: formData.coordinates
      })
      setMessage('Parcel uploaded successfully!')
      setFormData({ name: '', location: '', area: '', description: '', ownerId: formData.ownerId, coordinates: null })
      setTimeout(() => navigate('/surveyor/manage'), 1200)
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || 'Failed to upload parcel'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="surveyor-upload-page">
        <div className="page-header">
          <h1>Upload Parcel Data</h1>
          <p>Register GIS boundary data for a land owner</p>
        </div>

        <div className="register-container">
          <div className="form-section">
            <form onSubmit={handleSubmit} className="registration-form">
              {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>
              )}

              <div className="form-group">
                <label htmlFor="ownerId">Land Owner *</label>
                <select id="ownerId" name="ownerId" value={formData.ownerId} onChange={handleChange} required disabled={loading}>
                  <option value="">Select owner...</option>
                  {landowners.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="name">Parcel Name *</label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={loading} />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="Yaounde, Cameroon" required disabled={loading} />
              </div>

              <div className="form-group">
                <label htmlFor="area">Area (m²) *</label>
                <input id="area" name="area" type="number" value={formData.area} onChange={handleChange} required disabled={loading} />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} disabled={loading} />
              </div>

              <div className="boundary-section">
                <h3>Draw Boundaries</h3>
                <button
                  type="button"
                  className={`draw-btn ${isDrawing ? 'active' : ''}`}
                  onClick={() => setIsDrawing(!isDrawing)}
                  disabled={loading}
                >
                  {isDrawing ? 'Stop Drawing' : 'Start Drawing on Map'}
                </button>
                {formData.coordinates && (
                  <p className="coordinates-info">✓ {formData.coordinates.length} boundary points</p>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading || !formData.coordinates}>
                {loading ? 'Uploading...' : 'Upload Parcel'}
              </button>
            </form>
          </div>

          <div className="map-section">
            <h2>Boundary Map</h2>
            <GISMap
              height="600px"
              zoom={13}
              isDrawingMode={isDrawing}
              drawnPositions={formData.coordinates}
              onDraw={handleDrawing}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
