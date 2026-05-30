import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '../../layouts/DashboardLayout'
import AdminService from '../../services/AdminService'
import './admin.css'

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const limit = 10

  useEffect(() => {
    fetchUsers()
  }, [selectedRole, selectedStatus, currentPage])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const filters = {
        role: selectedRole === 'all' ? null : selectedRole,
        status: selectedStatus === 'all' ? null : selectedStatus,
        limit,
        offset: (currentPage - 1) * limit
      }
      const result = await AdminService.getAllUsers(filters)
      setUsers(result || [])
    } catch (err) {
      setError('Failed to load users')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await AdminService.updateUserStatus(userId, newStatus)
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
    } catch (err) {
      alert('Failed to update user status')
      console.error(err)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await AdminService.deleteUser(userId)
        setUsers(users.filter(u => u.id !== userId))
      } catch (err) {
        alert('Failed to delete user')
        console.error(err)
      }
    }
  }

  return (
    <DashboardLayout>
      <div className="admin-users-page">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Manage system users and their roles</p>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Users</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{users.length}</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Users</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Land Owners</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{users.filter(u => u.role === 'landowner').length}</p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Staff Members</p>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{users.filter(u => ['officer', 'surveyor', 'admin'].includes(u.role)).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select
            value={selectedRole}
            onChange={(e) => { setSelectedRole(e.target.value); setCurrentPage(1) }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              fontSize: '1rem'
            }}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="officer">Officer</option>
            <option value="surveyor">Surveyor</option>
            <option value="landowner">Land Owner</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1) }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border-color)',
              fontSize: '1rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: 'var(--secondary-color)' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid var(--border-color)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}>{user.first_name} {user.last_name}</td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.3rem 0.8rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          backgroundColor: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: 'var(--radius)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
