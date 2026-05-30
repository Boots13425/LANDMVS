import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import './DashboardPage.css'

export const DashboardPage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalParcels: 24,
    pendingApplications: 3,
    verifiedDocuments: 18,
    totalUsers: 156
  })

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="page-header">
          <h1>Welcome, {user?.firstName}!</h1>
          <p>Here&apos;s your land registry overview</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-label">Total Parcels</span>
              <span className="stat-value">{stats.totalParcels}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <span className="stat-label">Pending Applications</span>
              <span className="stat-value" style={{ color: '#f59e0b' }}>{stats.pendingApplications}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✔️</div>
            <div className="stat-content">
              <span className="stat-label">Verified Documents</span>
              <span className="stat-value" style={{ color: '#22c55e' }}>{stats.verifiedDocuments}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {user?.role === 'landowner' && (
              <>
                <button className="action-btn">
                  <span className="action-icon">🏠</span>
                  <span>Register New Land</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">📄</span>
                  <span>Upload Documents</span>
                </button>
              </>
            )}

            {user?.role === 'surveyor' && (
              <>
                <button className="action-btn">
                  <span className="action-icon">📤</span>
                  <span>Upload Parcel Data</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">🗺️</span>
                  <span>Draw Boundaries</span>
                </button>
              </>
            )}

            {user?.role === 'officer' && (
              <>
                <button className="action-btn">
                  <span className="action-icon">✔️</span>
                  <span>Review Applications</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">📋</span>
                  <span>Verification Tasks</span>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <button className="action-btn">
                  <span className="action-icon">👥</span>
                  <span>Manage Users</span>
                </button>
                <button className="action-btn">
                  <span className="action-icon">📊</span>
                  <span>View Analytics</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">📝</div>
              <div className="activity-content">
                <p className="activity-title">New application submitted</p>
                <span className="activity-time">2 hours ago</span>
              </div>
              <span className="activity-badge new">New</span>
            </div>

            <div className="activity-item">
              <div className="activity-icon">✅</div>
              <div className="activity-content">
                <p className="activity-title">Document verified</p>
                <span className="activity-time">5 hours ago</span>
              </div>
              <span className="activity-badge">Completed</span>
            </div>

            <div className="activity-item">
              <div className="activity-icon">⚠️</div>
              <div className="activity-content">
                <p className="activity-title">Verification pending</p>
                <span className="activity-time">1 day ago</span>
              </div>
              <span className="activity-badge pending">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
