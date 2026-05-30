import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import SurveyorService from '../../services/SurveyorService'
import './surveyor.css'

export const SurveyorDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await SurveyorService.getSurveyorStats()
      setStats(data)
    } catch (err) {
      console.error('Error fetching surveyor stats:', err)
      setError('Failed to load statistics. Ensure the backend is running.')
      setStats({ totalParcels: 0, uploadedToday: 0, pendingVerification: 0, verifiedParcels: 0 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="surveyor-dashboard">
        <div className="page-header">
          <h1>Surveyor Dashboard</h1>
          <p>Manage land parcel data and boundaries</p>
        </div>

        {loading && <p style={{ textAlign: 'center' }}>Loading statistics...</p>}

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef3c7', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
            <p>{error}</p>
            <button type="button" onClick={fetchStats}>Retry</button>
          </div>
        )}

        {!loading && stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <span className="stat-label">Total Parcels</span>
                  <span className="stat-value">{stats.totalParcels || 0}</span>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '4px solid #22c55e' }}>
                <div className="stat-icon">📤</div>
                <div className="stat-content">
                  <span className="stat-label">Uploaded Today</span>
                  <span className="stat-value">{stats.uploadedToday || 0}</span>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '4px solid #f59e0b' }}>
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <span className="stat-label">Pending Verification</span>
                  <span className="stat-value">{stats.pendingVerification || 0}</span>
                </div>
              </div>
              <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                <div className="stat-icon">✔️</div>
                <div className="stat-content">
                  <span className="stat-label">Verified Parcels</span>
                  <span className="stat-value">{stats.verifiedParcels || 0}</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="actions-grid">
                <Link to="/surveyor/upload" className="action-btn">
                  <span className="action-icon">📤</span>
                  <span>Upload Parcel Data</span>
                </Link>
                <Link to="/surveyor/boundaries" className="action-btn">
                  <span className="action-icon">🗺️</span>
                  <span>Draw Boundaries</span>
                </Link>
                <Link to="/surveyor/manage" className="action-btn">
                  <span className="action-icon">📋</span>
                  <span>Manage Parcels</span>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
