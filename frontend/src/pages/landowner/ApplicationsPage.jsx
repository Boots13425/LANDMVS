import React, { useState, useEffect, useContext } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { AuthContext } from '../../context/AuthContext'
import landService from '../../services/landService'
import './landowner.css'

export const ApplicationsPage = () => {
  const { user } = useContext(AuthContext)
  const [applications, setApplications] = useState([])
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ parcelId: '', applicationType: 'ownership_verification', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (user?.id) {
      fetchApplications()
      landService.getParcels({ userId: user.id }).then(setParcels).catch(() => {})
    }
  }, [user?.id])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await landService.getApplications({ userId: user.id })
      setApplications(data)
    } catch (err) {
      console.error(err)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.parcelId) {
      setMessage('Select a parcel')
      return
    }
    setSubmitting(true)
    setMessage('')
    try {
      await landService.createApplication({
        parcelId: parseInt(form.parcelId, 10),
        applicationType: form.applicationType,
        description: form.description
      })
      setMessage('Application submitted successfully')
      setShowForm(false)
      setForm({ parcelId: '', applicationType: 'ownership_verification', description: '' })
      fetchApplications()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status) => ({
    approved: '#22c55e',
    under_review: '#f59e0b',
    pending: '#3b82f6',
    rejected: '#ef4444'
  }[status] || '#6b7280')

  return (
    <DashboardLayout>
      <div className="applications-page">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>Track verification applications for your parcels</p>
          <button type="button" className="submit-btn" style={{ marginTop: '1rem' }} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Application'}
          </button>
        </div>

        {message && <div className="message success">{message}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <div className="form-group">
              <label>Parcel *</label>
              <select value={form.parcelId} onChange={(e) => setForm({ ...form, parcelId: e.target.value })} required>
                <option value="">Select parcel...</option>
                {parcels.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — {p.location}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Application type</label>
              <select value={form.applicationType} onChange={(e) => setForm({ ...form, applicationType: e.target.value })}>
                <option value="ownership_verification">Ownership Verification</option>
                <option value="boundary_update">Boundary Update</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
            </div>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {!loading && !error && (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 'var(--radius-lg)' }}>
            <thead>
              <tr style={{ background: 'var(--secondary-color)' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Parcel</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Submitted</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>{app.parcelName || `Parcel #${app.parcelId}`}</td>
                  <td style={{ padding: '1rem' }}>{(app.applicationType || '').replace(/_/g, ' ')}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ color: getStatusColor(app.status), fontWeight: 600 }}>{app.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button type="button" onClick={() => setSelectedApp(app)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {applications.length === 0 && !loading && !showForm && (
          <p style={{ marginTop: '1rem' }}>No applications yet. Register a parcel first, then submit an application.</p>
        )}

        {selectedApp && (
          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--secondary-color)', borderRadius: 'var(--radius-lg)' }}>
            <h3>Application #{selectedApp.id}</h3>
            <p>Status: <strong>{selectedApp.status}</strong></p>
            {selectedApp.comments && <p>Officer comments: {selectedApp.comments}</p>}
            <button type="button" onClick={() => setSelectedApp(null)}>Close</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
