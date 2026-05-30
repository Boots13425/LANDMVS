import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { VerificationPage } from './pages/officer/VerificationPage'
import { RegisterLandPage } from './pages/landowner/RegisterLandPage'
import { UploadDocumentsPage } from './pages/landowner/UploadDocumentsPage'
import { MyParcelsPage } from './pages/landowner/MyParcelsPage'
import { ApplicationsPage } from './pages/landowner/ApplicationsPage'
import { CertificatesPage } from './pages/landowner/CertificatesPage'
import { SurveyorDashboard } from './pages/surveyor/SurveyorDashboard'
import { SurveyorUploadPage } from './pages/surveyor/SurveyorUploadPage'
import { SurveyorBoundariesPage } from './pages/surveyor/SurveyorBoundariesPage'
import { SurveyorManagePage } from './pages/surveyor/SurveyorManagePage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage'
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '2rem' }}>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

const RoleProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '2rem' }}>Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  if (requiredRole && !roles.includes(user?.role)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column' }}>
        <h1>Access Denied</h1>
        <p>You don&apos;t have permission to access this page</p>
      </div>
    )
  }

  return children
}

const SmartDashboard = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '2rem' }}>Loading...</div>
      </div>
    )
  }

  switch (user?.role) {
    case 'officer':
      return <VerificationPage />
    case 'landowner':
      return <MyParcelsPage />
    case 'surveyor':
      return <SurveyorDashboard />
    case 'admin':
      return <AdminUsersPage />
    default:
      return <DashboardPage />
  }
}

function AppContent() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <SmartDashboard />
          </ProtectedRoute>
        }
      />

      {/* Officer */}
      <Route
        path="/officer/verification"
        element={
          <RoleProtectedRoute requiredRole="officer">
            <VerificationPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/officer/applications"
        element={
          <RoleProtectedRoute requiredRole="officer">
            <VerificationPage />
          </RoleProtectedRoute>
        }
      />

      {/* Landowner */}
      <Route
        path="/landowner/register"
        element={
          <RoleProtectedRoute requiredRole="landowner">
            <RegisterLandPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/landowner/upload"
        element={
          <RoleProtectedRoute requiredRole="landowner">
            <UploadDocumentsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/landowner/documents"
        element={
          <RoleProtectedRoute requiredRole="landowner">
            <UploadDocumentsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/landowner/parcels"
        element={
          <RoleProtectedRoute requiredRole="landowner">
            <MyParcelsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/landowner/applications"
        element={
          <RoleProtectedRoute requiredRole="landowner">
            <ApplicationsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/landowner/certificates"
        element={
          <RoleProtectedRoute requiredRole="landowner">
            <CertificatesPage />
          </RoleProtectedRoute>
        }
      />

      {/* Surveyor */}
      <Route
        path="/surveyor/dashboard"
        element={
          <RoleProtectedRoute requiredRole="surveyor">
            <SurveyorDashboard />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/surveyor/upload"
        element={
          <RoleProtectedRoute requiredRole="surveyor">
            <SurveyorUploadPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/surveyor/boundaries"
        element={
          <RoleProtectedRoute requiredRole="surveyor">
            <SurveyorBoundariesPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/surveyor/manage"
        element={
          <RoleProtectedRoute requiredRole="surveyor">
            <SurveyorManagePage />
          </RoleProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/users"
        element={
          <RoleProtectedRoute requiredRole="admin">
            <AdminUsersPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <RoleProtectedRoute requiredRole="admin">
            <AdminAnalyticsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <RoleProtectedRoute requiredRole="admin">
            <AdminAuditLogsPage />
          </RoleProtectedRoute>
        }
      />
      <Route path="/admin/audit" element={<Navigate to="/admin/audit-logs" replace />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}
