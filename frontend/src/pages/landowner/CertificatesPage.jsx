import React, { useState, useEffect, useContext } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import { AuthContext } from '../../context/AuthContext'
import landService from '../../services/landService'
import './landowner.css'

export const CertificatesPage = () => {
  const { user } = useContext(AuthContext)
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCert, setSelectedCert] = useState(null)

  useEffect(() => {
    if (user?.id) {
      fetchCertificates()
    }
  }, [user?.id])

  const fetchCertificates = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch approved applications which contain certificates
      const approvedApps = await landService.getApplications({ userId: user?.id, status: 'approved' })
      // Map approved applications to certificates
      const certs = Array.isArray(approvedApps) ? approvedApps.map(app => ({
        id: app.id,
        certificateNumber: app.certificateNumber || `CERT-${app.id}`,
        parcelName: app.parcelName || 'Unknown Parcel',
        location: app.location || 'N/A',
        area: app.area || 0,
        issuedDate: app.approvedDate || app.submittedDate || new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString().split('T')[0],
        status: 'valid',
        owner: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Unknown'
      })) : []
      setCertificates(certs)
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setError('Failed to load your certificates')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    return status === 'valid' ? '#22c55e' : '#ef4444'
  }

  const handleDownload = (cert) => {
    console.log('Downloading certificate:', cert.certificateNumber)
    alert(`Downloading certificate: ${cert.certificateNumber}`)
  }

  const handlePrint = (cert) => {
    console.log('Printing certificate:', cert.certificateNumber)
    window.print()
  }

  return (
    <DashboardLayout>
      <div className="certificates-page">
        <div className="page-header">
          <h1>Land Certificates</h1>
          <p>View and manage your official land ownership certificates</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>Loading your certificates...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <p>{error}</p>
            <button onClick={fetchCertificates} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
        <div className="certificates-container">
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Certificates</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{certificates.length}</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{certificates.filter(c => c.status === 'valid').length}</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Land Area</p>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{certificates.reduce((sum, c) => sum + c.area, 0).toLocaleString()} m²</p>
            </div>
          </div>

          {/* Certificates Grid */}
          <h2>Your Certificates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {certificates.map((cert) => (
              <div
                key={cert.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedCert(cert)}
              >
                {/* Certificate Header */}
                <div style={{ padding: '1.5rem', backgroundColor: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)', color: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', opacity: 0.9 }}>Certificate Number</p>
                      <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>{cert.certificateNumber}</h3>
                    </div>
                    <span
                      style={{
                        padding: '0.3rem 0.8rem',
                        backgroundColor: 'white',
                        color: getStatusColor(cert.status),
                        borderRadius: 'var(--radius)',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}
                    >
                      ✓ {cert.status}
                    </span>
                  </div>
                </div>

                {/* Certificate Info */}
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Property</p>
                    <p style={{ margin: 0, fontWeight: '600' }}>{cert.parcelName}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Location</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{cert.location}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Area</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{cert.area.toLocaleString()} m²</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Issued</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{cert.issuedDate}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Expires</p>
                      <p style={{ margin: 0, fontWeight: '600', fontSize: '0.9rem' }}>{cert.expiryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(cert)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrint(cert)
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'var(--secondary-color)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            ))}
          </div>

          {certificates.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No certificates issued yet</p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Complete the verification process to receive your land certificate</p>
            </div>
          )}

          {/* Detailed View */}
          {selectedCert && (
            <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--radius-lg)', borderLeft: '4px solid var(--primary-color)' }}>
              <h3>Certificate Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' }}>Certificate Number</p>
                  <p style={{ fontWeight: '600', margin: '0.5rem 0 0 0' }}>{selectedCert.certificateNumber}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' }}>Property Name</p>
                  <p style={{ fontWeight: '600', margin: '0.5rem 0 0 0' }}>{selectedCert.parcelName}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' }}>Location</p>
                  <p style={{ fontWeight: '600', margin: '0.5rem 0 0 0' }}>{selectedCert.location}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' }}>Area</p>
                  <p style={{ fontWeight: '600', margin: '0.5rem 0 0 0' }}>{selectedCert.area.toLocaleString()} m²</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' }}>Issued Date</p>
                  <p style={{ fontWeight: '600', margin: '0.5rem 0 0 0' }}>{selectedCert.issuedDate}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' }}>Expiry Date</p>
                  <p style={{ fontWeight: '600', margin: '0.5rem 0 0 0' }}>{selectedCert.expiryDate}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCert(null)}
                style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </DashboardLayout>
  )
}
