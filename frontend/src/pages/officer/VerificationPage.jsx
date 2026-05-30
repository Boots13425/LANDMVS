import React, { useState, useEffect, useMemo } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { GISMap } from '../../components/maps/GISMap'
import OfficerService from '../../services/OfficerService'
import './officer.css'

export const VerificationPage = () => {
  const [selectedApp, setSelectedApp] = useState(null)
  const [applications, setApplications] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviewComments, setReviewComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [statusFilter])

  const fetchApplications = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = statusFilter ? { status: statusFilter } : {}
      const data = await OfficerService.getApplications(filters)
      setApplications(data)
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Failed to load applications from database. Ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const openReview = async (app) => {
    try {
      const detail = await OfficerService.getApplicationDetail(app.id)
      setSelectedApp(detail)
      setReviewComments('')
    } catch {
      setSelectedApp(app)
    }
  }

  const handleReview = async (appId, status) => {
    setIsSubmitting(true)
    try {
      await OfficerService.reviewApplication(appId, status, reviewComments)
      setApplications((prev) => prev.filter((a) => a.id !== appId))
      setSelectedApp(null)
      setReviewComments('')
      alert(`Application ${status}`)
      fetchApplications()
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${status} application`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const mapParcelsFromList = useMemo(
    () =>
      applications
        .filter((a) => a.geometry?.length >= 3)
        .map((a) => ({
          id: a.parcelId,
          name: a.parcelName,
          area: a.area,
          status: a.status,
          geometry: a.geometry
        })),
    [applications]
  )

  const selectedMapParcel = useMemo(() => {
    if (!selectedApp?.geometry?.length) return []
    return [
      {
        id: selectedApp.parcelId,
        name: selectedApp.parcelName,
        area: selectedApp.area,
        status: selectedApp.parcelStatus || selectedApp.status,
        geometry: selectedApp.geometry
      }
    ]
  }, [selectedApp])

  return (
    <DashboardLayout>
      <div className="verification-page">
        <div className="page-header">
          <h1>Application Verification</h1>
          <p>Review land ownership applications submitted from the database</p>
        </div>

        {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Loading applications...</p>}

        {error && (
          <div style={{ padding: '1.5rem', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
            <p>{error}</p>
            <button type="button" onClick={fetchApplications}>Retry</button>
          </div>
        )}

        {!loading && (
          <>
            {mapParcelsFromList.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2>Parcel boundaries ({mapParcelsFromList.length})</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  All parcels linked to the applications below
                </p>
                <GISMap height="380px" parcels={mapParcelsFromList} zoom={11} />
              </div>
            )}

            <div className="applications-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Applications ({applications.length})</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {applications.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', background: 'var(--secondary-color)', borderRadius: 'var(--radius-lg)' }}>
                  No applications found. New parcels uploaded by surveyors or landowners will appear here automatically.
                </p>
              ) : (
                <div className="applications-table-wrapper">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Applicant</th>
                        <th>Parcel</th>
                        <th>Type</th>
                        <th>Submitted</th>
                        <th>Status</th>
                        <th>Map</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>{app.applicantName}</td>
                          <td>{app.parcelName}</td>
                          <td style={{ textTransform: 'capitalize' }}>{(app.applicationType || '').replace(/_/g, ' ')}</td>
                          <td>{app.submittedDate ? new Date(app.submittedDate).toLocaleDateString() : '—'}</td>
                          <td>
                            <span className={`status-badge ${app.status}`}>{app.status}</span>
                          </td>
                          <td>{app.geometry?.length >= 3 ? '✓' : '—'}</td>
                          <td>
                            <button type="button" onClick={() => openReview(app)} className="review-btn">
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {selectedApp && (
              <div className="application-detail">
                <h2>Application Details — #{selectedApp.id}</h2>
                <div style={{ backgroundColor: 'var(--secondary-color)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Applicant</span>
                      <p style={{ fontWeight: '600' }}>{selectedApp.applicantName}</p>
                      <p style={{ fontSize: '0.9rem' }}>{selectedApp.applicantEmail}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Parcel</span>
                      <p style={{ fontWeight: '600' }}>{selectedApp.parcelName}</p>
                      <p>{selectedApp.location} — {selectedApp.area} m²</p>
                    </div>
                  </div>

                  {selectedApp.documents?.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h3>Documents</h3>
                      <ul>
                        {selectedApp.documents.map((d) => (
                          <li key={d.id}>{d.fileName} — {d.status}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                    Verification Comments
                  </label>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter verification remarks..."
                    style={{ width: '100%', minHeight: '100px', padding: '0.75rem', marginBottom: '1rem' }}
                  />

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button type="button" onClick={() => handleReview(selectedApp.id, 'approved')} disabled={isSubmitting} style={{ flex: 1, padding: '0.75rem', background: 'var(--success-color)', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>
                      Approve
                    </button>
                    <button type="button" onClick={() => handleReview(selectedApp.id, 'rejected')} disabled={isSubmitting} style={{ flex: 1, padding: '0.75rem', background: 'var(--error-color)', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>
                      Reject
                    </button>
                    <button type="button" onClick={() => handleReview(selectedApp.id, 'under_review')} disabled={isSubmitting} style={{ padding: '0.75rem 1rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 'var(--radius)' }}>
                      Under Review
                    </button>
                    <button type="button" onClick={() => setSelectedApp(null)} style={{ padding: '0.75rem 1rem' }}>
                      Close
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <h3>Parcel Boundary Map</h3>
                  {selectedApp.geometry?.length >= 3 ? (
                    <GISMap height="420px" parcels={selectedMapParcel} zoom={14} />
                  ) : (
                    <p style={{ padding: '1rem', background: '#fef3c7', borderRadius: 'var(--radius)' }}>
                      No boundary geometry stored for this parcel.
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
