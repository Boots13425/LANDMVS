import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import AdminService from '../../services/AdminService'
import './admin.css'

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await AdminService.getAnalytics()
      setAnalytics(data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading analytics...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !analytics) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
          <p>{error || 'No analytics data available'}</p>
          <button onClick={fetchAnalytics} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="admin-analytics-page">
        <div className="page-header">
          <h1>System Analytics</h1>
          <p>View comprehensive system statistics and reports</p>
        </div>

        {/* Key Metrics */}
        <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Key Metrics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Parcels</p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{analytics.totalParcels || 0}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Applications</p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{analytics.totalApplications || 0}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verified Parcels</p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e' }}>{analytics.verifiedParcels || 0}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Certificates Issued</p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{analytics.approvedCertificates || 0}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Users</p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#ec4899' }}>{analytics.totalUsers || 0}</p>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Approval Rate</p>
            <p style={{ margin: 0, fontSize: '2.5rem', fontWeight: 'bold', color: '#06b6d4' }}>{analytics.approvalRate || 0}%</p>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          {/* Monthly Trend */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Monthly Trends</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px' }}>
              {(analytics.monthlyStats || []).map((stat, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${((stat.parcels || 0) / Math.max(...(analytics.monthlyStats || []).map(s => s.parcels))) * 150 || 0}px`,
                      backgroundColor: '#3b82f6',
                      borderRadius: 'var(--radius)',
                      marginBottom: '0.5rem',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  />
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '600' }}>{stat.month}</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{stat.parcels} parcels</p>
                </div>
              ))}
            </div>
          </div>

          {/* Users by Role */}
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.5rem 0' }}>Users by Role</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Land Owners', value: analytics.byRole?.landowners || 0, color: '#22c55e' },
                { label: 'Surveyors', value: analytics.byRole?.surveyors || 0, color: '#f59e0b' },
                { label: 'Officers', value: analytics.byRole?.officers || 0, color: '#3b82f6' },
                { label: 'Admins', value: analytics.byRole?.admin || 0, color: '#8b5cf6' }
              ].map((role, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '500' }}>{role.label}</span>
                    <span style={{ fontWeight: '700', color: role.color }}>{role.value}</span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--secondary-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        backgroundColor: role.color,
                        width: `${analytics.overview?.usersRegistered ? (role.value / analytics.overview.usersRegistered) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Status */}
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.5rem 0' }}>Application Status Distribution</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Approved', value: analytics.applicationStatus?.approved || 0, color: '#22c55e' },
              { label: 'Under Review', value: analytics.applicationStatus?.under_review || 0, color: '#f59e0b' },
              { label: 'Pending', value: analytics.applicationStatus?.pending || 0, color: '#3b82f6' },
              { label: 'Rejected', value: analytics.applicationStatus?.rejected || 0, color: '#ef4444' }
            ].map((status, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: status.color }}>{status.value}</p>
                <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{status.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
