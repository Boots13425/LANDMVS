import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

export const Sidebar = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)

  const getMenuItems = () => {
    const baseItems = [
      { label: 'Dashboard', path: '/dashboard', icon: '📊' }
    ]

    const roleMenus = {
      admin: [
        { label: 'Users', path: '/admin/users', icon: '👥' },
        { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: '📋' }
      ],
      landowner: [
        { label: 'Register Land', path: '/landowner/register', icon: '🏠' },
        { label: 'My Parcels', path: '/landowner/parcels', icon: '📍' },
        { label: 'Applications', path: '/landowner/applications', icon: '📄' },
        { label: 'Documents', path: '/landowner/documents', icon: '📎' },
        { label: 'Certificates', path: '/landowner/certificates', icon: '🎖️' }
      ],
      surveyor: [
        { label: 'Dashboard', path: '/surveyor/dashboard', icon: '📊' },
        { label: 'Upload Parcels', path: '/surveyor/upload', icon: '📤' },
        { label: 'Draw Boundaries', path: '/surveyor/boundaries', icon: '🗺️' },
        { label: 'Manage Parcels', path: '/surveyor/manage', icon: '⚙️' }
      ],
      officer: [
        { label: 'Verification', path: '/officer/verification', icon: '✔️' },
        { label: 'All Applications', path: '/officer/applications', icon: '📋' }
      ]
    }

    const roleItems = roleMenus[user?.role] || []
    if (user?.role === 'surveyor') {
      return roleItems
    }
    return [...baseItems, ...roleItems]
  }

  const menuItems = getMenuItems()
  const isActive = (path) => location.pathname === path

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Collapse' : 'Expand'}
      >
        {isOpen ? '◀' : '▶'}
      </button>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            {isOpen && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {isOpen && user && (
          <div className="user-info">
            <div className="avatar">{(user.firstName || user.email || '?').charAt(0)}</div>
            <span className="user-role">{user.role}</span>
          </div>
        )}
      </div>
    </aside>
  )
}
