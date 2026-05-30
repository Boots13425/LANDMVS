import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { GISMap } from '../../components/maps/GISMap'
import SurveyorService from '../../services/SurveyorService'
import './surveyor.css'

export const SurveyorManagePage = () => {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadParcels()
  }, [statusFilter])

  const loadParcels = async () => {
    setLoading(true)
    try {
      const filters = statusFilter ? { status: statusFilter } : {}
      const data = await SurveyorService.getParcels(filters)
      setParcels(data)
    } catch {
      setMessage('Failed to load parcels')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (parcelId, status) => {
    try {
      await SurveyorService.updateParcelStatus(parcelId, status)
      setMessage(`Parcel marked as ${status}`)
      loadParcels()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update status')
    }
  }

  return (
    <DashboardLayout>
      <div className="surveyor-manage-page">
        <div className="page-header">
          <h1>Manage Parcels</h1>
          <p>View and update parcel verification status</p>
          <Link to="/surveyor/upload" className="submit-btn" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
            + Upload New Parcel
          </Link>
        </div>

        {message && <div className="message success">{message}</div>}

        <div style={{ marginBottom: '1rem' }}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p>Loading parcels...</p>
        ) : (
          <>
            <h2 style={{ marginTop: '1.5rem' }}>All parcel boundaries</h2>
            <GISMap height="380px" parcels={parcels} zoom={11} fitBounds />

            <table className="applications-table" style={{ marginTop: '2rem', width: '100%' }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Area (m²)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.location}</td>
                    <td>{p.area}</td>
                    <td><span className={`status-badge ${p.status}`}>{p.status}</span></td>
                    <td>
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value)}
                      >
                        <option value="pending">pending</option>
                        <option value="verified">verified</option>
                        <option value="approved">approved</option>
                        <option value="rejected">rejected</option>
                      </select>
                      <Link to="/surveyor/boundaries" style={{ marginLeft: '0.5rem' }}>Edit map</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {parcels.length === 0 && (
              <p style={{ textAlign: 'center', padding: '2rem' }}>
                No parcels yet. <Link to="/surveyor/upload">Upload your first parcel</Link>
              </p>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
