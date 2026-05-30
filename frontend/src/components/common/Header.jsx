import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

export const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🌍</span>
          <span className="logo-text">CAMEROON LAND REGISTRY</span>
        </Link>

        <nav className="header-nav">
          {user ? (
            <div className="user-menu">
              <span className="user-name">{user.firstName} {user.lastName}</span>
              <div className="menu-toggle" onClick={() => setShowMenu(!showMenu)}>
                <span className="avatar">{user.firstName.charAt(0)}</span>
              </div>

              {showMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="menu-item">
                    My Profile
                  </Link>
                  <Link to="/settings" className="menu-item">
                    Settings
                  </Link>
                  <button onClick={handleLogout} className="menu-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="login-link">Login</Link>
              <Link to="/register" className="register-link">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
