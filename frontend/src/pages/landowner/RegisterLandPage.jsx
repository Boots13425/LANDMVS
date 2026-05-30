import React, { useState } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { GISMap } from '../../components/maps/GISMap'
import landService from '../../services/landService'
import './landowner.css'

export const RegisterLandPage = () => {
  const [formData, setFormData] = useState({
    parcelName: '',
    location: '',
    area: '',
    description: '',
    coordinates: null
  })
  const [isDrawing, setIsDrawing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleDrawing = (coordinates) => {
    setFormData(prev => ({
      ...prev,
      coordinates
    }))
    setIsDrawing(false)
    setMessage('Boundaries drawn successfully')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await landService.createParcel({
        name: formData.parcelName,
        location: formData.location,
        area: parseFloat(formData.area),
        description: formData.description,
        geometry: formData.coordinates
      })

      setMessage('Land parcel registered successfully!')
      setFormData({
        parcelName: '',
        location: '',
        area: '',
        description: '',
        coordinates: null
      })
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.message || 'Failed to register land'}`)
    }

    setLoading(false)
  }

  return (
    <DashboardLayout>
      <div className="register-land-page">
        <div className="page-header">
          <h1>Register New Land Parcel</h1>
          <p>Define your land boundaries and provide details</p>
        </div>

        <div className="register-container">
          <div className="form-section">
            <h2>Parcel Information</h2>
            <form onSubmit={handleSubmit} className="registration-form">
              {message && (
                <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="parcelName">Parcel Name</label>
                <input
                  type="text"
                  id="parcelName"
                  name="parcelName"
                  value={formData.parcelName}
                  onChange={handleChange}
                  placeholder="e.g., Residential Plot A"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location/Address</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Yaounde, Cameroon"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="area">Area (m²)</label>
                <input
                  type="number"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="5000"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your land parcel..."
                  rows={4}
                  disabled={loading}
                />
              </div>

              <div className="boundary-section">
                <h3>Define Land Boundaries</h3>
                <button 
                  type="button"
                  className={`draw-btn ${isDrawing ? 'active' : ''}`}
                  onClick={() => setIsDrawing(!isDrawing)}
                  disabled={loading}
                >
                  {isDrawing ? '✓ Stop Drawing' : '✏️ Draw Boundaries'}
                </button>
                {formData.coordinates && (
                  <p className="coordinates-info">
                    ✓ {formData.coordinates.length} points defined
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading || !formData.coordinates}
              >
                {loading ? 'Registering...' : 'Register Land Parcel'}
              </button>
            </form>
          </div>

          <div className="map-section">
            <h2>Land Boundaries Map</h2>
            <GISMap
              height="600px"
              zoom={13}
              isDrawingMode={isDrawing}
              drawnPositions={formData.coordinates}
              onDraw={handleDrawing}
            />
            <p className="map-help">
              Click and drag on the map to define your land boundaries. Requires at least 3 points.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
