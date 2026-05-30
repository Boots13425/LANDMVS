import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import AdminService from '../../services/AdminService'
import './admin.css'

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchLogs()
  }, [filter])

  const fetchLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const filters = {
        limit: 50,
        offset: 0
      }
      if (filter !== 'all') {
        filters.action = filter
      }
      const data = await AdminService.getAuditLogs(filters)
      setLogs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action) => {
    const colors = {
      CREATE_PARCEL: '#22c55e',
      UPDATE_PARCEL: '#3b82f6',
      APPROVE_APPLICATION: '#22c55e',
      REJECT_APPLICATION: '#ef4444',
      UPLOAD_DOCUMENTS: '#f59e0b',
      GENERATE_CERTIFICATE: '#8b5cf6',
      LOGIN: '#06b6d4',
      LOGIN_FAILED: '#ef4444',
      DEACTIVATE_USER: '#ef4444'
    }
    return colors[action] || '#6b7280'
  }

  const getStatusIcon = (status) => {
    return status === 'success' ? '✓' : '✕'
  }

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.action === filter
    const matchesSearch = searchTerm === '' || 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <DashboardLayout>
      <div className="admin-audit-logs-page">
        <div className="page-header">
          <h1>Audit Logs</h1>
          <p>System activity and user action history</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>Loading audit logs...</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444', backgroundColor: '#fee2e2', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }}>
            <p>{error}</p>
            <button onClick={fetchLogs} style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Actions</p>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{logs.length}</p>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Successful</p>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{logs.filter(l => l.status === 'success').length}</p>
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Failed</p>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{logs.filter(l => l.status === 'failed').length}</p>
              </div>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by user, resource, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  minWidth: '250px',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  fontSize: '1rem'
                }}
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-color)',
                  fontSize: '1rem'
                }}
              >
                <option value="all">All Actions</option>
                <option value="CREATE_PARCEL">Create Parcel</option>
                <option value="UPDATE_PARCEL">Update Parcel</option>
                <option value="APPROVE_APPLICATION">Approve Application</option>
                <option value="REJECT_APPLICATION">Reject Application</option>
                <option value="LOGIN">Login</option>
              </select>
            </div>

            {/* Logs Table */}
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--secondary-color)' }}>
                  <tr>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Timestamp</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>User</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Action</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Resource</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: log.status === 'failed' ? '#fef2f2' : 'white'
                      }}
                      title={log.details}
                    >
                      <td style={{ padding: '1rem', fontSize: '0.85rem', fontFamily: 'monospace' }}>{log.timestamp}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{log.user}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          backgroundColor: getActionColor(log.action),
                          color: 'white',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-block',
                          textTransform: 'uppercase'
                        }}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '500' }}>{log.resource}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.3rem 0.8rem',
                          backgroundColor: log.status === 'success' ? '#dcfce7' : '#fee2e2',
                          color: log.status === 'success' ? '#166534' : '#991b1b',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-block'
                        }}>
                          {getStatusIcon(log.status)} {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredLogs.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No audit logs found matching your filters
                </div>
              )}
            </div>

            {/* Log Details Info */}
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: 'var(--radius-lg)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <p style={{ margin: 0 }}>💡 Tip: Hover over entries to see full details. Logs are automatically archived after 90 days.</p>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
