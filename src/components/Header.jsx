import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [userId, setUserId] = useState('')
  const [userIdType, setUserIdType] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (userId) {
      // Close modal and navigate to dashboard
      setShowLoginModal(false)
      navigate('/dashboard')
    }
  }

  return (
    <>
      <header className="gm-header">
        <div className="header-top-strip"></div>
        <div className="header-main">
          <div className="header-container">
            <div className="header-left">
              <div className="logo-section">
                <div className="logo-icon">
                  <img 
                    src="/gmulogo1.png" 
                    alt="GM Finance Logo" 
                    className="logo-image"
                  />
                </div>
                <div className="logo-text">
                  <h1 className="logo-title">GM FINANCE</h1>
                  <p className="logo-subtitle">GM One</p>
                </div>
              </div>
            </div>

            <div className="header-right">
              <nav className="header-nav">
                <div className="nav-row nav-row-top">
                  <Link to="/" className="nav-link">Home</Link>
                  <Link to="/clients" className="nav-link">Clients</Link>
                  <Link to="/documents" className="nav-link">Documents</Link>
                  <Link to="/audit-readiness" className="nav-link">Audit</Link>
                  <Link to="/notifications" className="nav-link">Notifications</Link>
                  <Link to="/grievance" className="nav-link">Grievance</Link>
                  <Link to="/profile" className="nav-link">Profile</Link>
                </div>
                <div className="nav-row nav-row-bottom">
                  <Link to="/about" className="nav-link">About Us</Link>
                  <Link to="/help" className="nav-link">Help & Support</Link>
                  <Link to="/contact" className="nav-link">Contact Us</Link>
                </div>
              </nav>
              <div className="header-actions">
                <button 
                  className="btn-login-header"
                  onClick={() => setShowLoginModal(true)}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="login-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Login to GM Finance Portal</h2>
              <button 
                className="modal-close"
                onClick={() => setShowLoginModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleLogin} className="modal-form">
              <div className="form-group">
                <label className="form-label">User ID</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter PAN / Aadhaar / CA ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">User ID Type</label>
                <select
                  className="form-input"
                  value={userIdType}
                  onChange={(e) => setUserIdType(e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="pan">PAN</option>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="ca">CA ID</option>
                  <option value="staff">Staff ID</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Continue
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowLoginModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Header

