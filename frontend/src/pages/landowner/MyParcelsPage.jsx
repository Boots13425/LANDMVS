import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { GISMap } from '../../components/maps/GISMap'
import { AuthContext } from '../../context/AuthContext'
import landService from '../../services/landService'
import './landowner.css'

export const MyParcelsPage = () => {
  const { user } = useContext(AuthContext)
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedParcel, setSelectedParcel] = useState(null)

  useEffect(() => {
    if (user?.id) fetchParcels()
  }, [user?.id])

  const fetchParcels = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await landService.getParcels({ userId: user.id })
      setParcels(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load parcels')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = { verified: '#22c55e', approved: '#22c55e', pending: '#f59e0b', rejected: '#ef4444' }
    return colors[status] || '#6b7280'
  }

  return (
    <DashboardLayout>
      <div className="my-parcels-page">
        <div className="page-header">
          <h1>My Land Parcels</h1>
          <p>View and manage your registered land parcels</p>
          <Link to="/landowner/register" className="submit-btn" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>
            + Register New Parcel
          </Link>
        </div>

        {loading && <p style={{ textAlign: 'center' }}>Loading parcels...</p>}
        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
            <p>{error}</p>
            <button type="button" onClick={fetchParcels}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {parcels.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2>Your parcel boundaries</h2>
                <GISMap height="380px" parcels={parcels} zoom={11} onParcelClick={setSelectedParcel} fitBounds />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {parcels.map((parcel) => (
                <div
                  key={parcel.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedParcel(parcel)}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedParcel(parcel)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-lg)',
                    border: selectedParcel?.id === parcel.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                    padding: '1.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <h3 style={{ margin: '0 0 0.5rem' }}>{parcel.name}</h3>
                  <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>📍 {parcel.location}</p>
                  <p style={{ margin: '0.25rem 0' }}>📐 {Number(parcel.area).toLocaleString()} m²</p>
                  <span style={{ padding: '0.25rem 0.6rem', backgroundColor: getStatusColor(parcel.status), color: 'white', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}>
                    {parcel.status}
                  </span>
                </div>
              ))}
            </div>

            {parcels.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No parcels yet.</p>
                <Link to="/landowner/register">Register your first parcel</Link>
              </div>
            )}

            {selectedParcel && (
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--secondary-color)', borderRadius: 'var(--radius-lg)' }}>
                <h3>{selectedParcel.name}</h3>
                <p>{selectedParcel.description || 'No description'}</p>
                <GISMap height="320px" zoom={14} parcels={[selectedParcel]} fitBounds />
                <Link to="/landowner/applications" style={{ display: 'inline-block', marginTop: '1rem' }}>
                  Submit verification application →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
