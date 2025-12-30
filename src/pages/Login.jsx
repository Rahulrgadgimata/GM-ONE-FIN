import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'

const Login = () => {
  const [userId, setUserId] = useState('')
  const [userIdType, setUserIdType] = useState('')
  const [error, setError] = useState('')

  const handleContinue = (e) => {
    e.preventDefault()
    if (!userId) {
      setError('Please enter your User ID')
      return
    }
    // Navigate to dashboard or next step
    window.location.href = '/dashboard'
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-left">
            <h2 className="login-title">Login to GM Finance Portal</h2>
            <p className="login-subtitle">Enter your User ID to continue</p>
            
            <form onSubmit={handleContinue} className="login-form">
              <div className="form-group">
                <label htmlFor="userId" className="form-label">
                  User ID <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="userId"
                  className="form-input"
                  placeholder="Enter PAN / Aadhaar / CA ID"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value)
                    setError('')
                  }}
                  required
                />
                {error && <div className="error-message">{error}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">User ID Type</label>
                <select
                  className="form-input"
                  value={userIdType}
                  onChange={(e) => setUserIdType(e.target.value)}
                >
                  <option value="">Select User ID Type</option>
                  <option value="pan">PAN</option>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="ca">CA ID</option>
                  <option value="staff">Staff ID</option>
                </select>
              </div>

              <div className="captcha-placeholder">
                <div className="captcha-box">
                  <p>CAPTCHA Placeholder</p>
                  <button type="button" className="btn-refresh">Refresh</button>
                </div>
                <input
                  type="text"
                  className="form-input captcha-input"
                  placeholder="Enter CAPTCHA"
                />
              </div>

              <div className="login-actions">
                <button type="submit" className="btn btn-primary btn-login">
                  Continue
                </button>
                <Link to="/" className="btn btn-secondary btn-back">
                  Back
                </Link>
              </div>

              <div className="alternate-login">
                <p className="alternate-text">Alternate Login Methods</p>
                <button type="button" className="btn btn-outline btn-alternate">
                  Login via Net Banking
                </button>
              </div>
            </form>
          </div>

          <div className="login-right">
            <div className="info-box">
              <h3 className="info-title">Know about your User ID</h3>
              
              <div className="info-section">
                <h4 className="info-heading">PAN (Permanent Account Number)</h4>
                <p className="info-text">
                  Your 10-character alphanumeric PAN issued by Income Tax Department.
                  Format: ABCDE1234F
                </p>
              </div>

              <div className="info-section">
                <h4 className="info-heading">Aadhaar Number</h4>
                <p className="info-text">
                  Your 12-digit unique identification number issued by UIDAI.
                  Format: 1234 5678 9012
                </p>
              </div>

              <div className="info-section">
                <h4 className="info-heading">CA ID</h4>
                <p className="info-text">
                  Your Chartered Accountant registration ID issued by ICAI.
                  Format: CA123456
                </p>
              </div>

              <div className="info-section">
                <h4 className="info-heading">Staff ID</h4>
                <p className="info-text">
                  Your staff identification number assigned by your organization.
                  Format: STAFF123456
                </p>
              </div>

              <div className="help-section">
                <p className="help-text">
                  <strong>Need Help?</strong> Contact support or refer to the user guide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

