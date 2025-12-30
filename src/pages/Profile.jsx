import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Profile.css'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@gmfinance.com',
    userId: 'CA123456',
    role: 'Chartered Accountant',
    phone: '+91 98765 43210',
    organization: 'GM Finance & Associates',
    joinDate: '2020-01-15',
    lastLogin: '2024-01-12 14:30:25',
    loginLocation: 'Mumbai, Maharashtra'
  }

  const loginHistory = [
    { id: 1, date: '2024-01-12', time: '14:30:25', location: 'Mumbai, Maharashtra', ip: '192.168.1.100', status: 'Success' },
    { id: 2, date: '2024-01-11', time: '09:15:42', location: 'Mumbai, Maharashtra', ip: '192.168.1.100', status: 'Success' },
    { id: 3, date: '2024-01-10', time: '16:45:18', location: 'Delhi, NCR', ip: '192.168.1.101', status: 'Success' },
    { id: 4, date: '2024-01-09', time: '11:20:33', location: 'Mumbai, Maharashtra', ip: '192.168.1.100', status: 'Success' },
    { id: 5, date: '2024-01-08', time: '13:55:07', location: 'Mumbai, Maharashtra', ip: '192.168.1.100', status: 'Failed' }
  ]

  return (
    <div className="profile-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-subtitle">Manage your account settings and preferences</p>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Information
          </button>
          <button
            className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security & Password
          </button>
          <button
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Login Activity
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-content">
            <div className="card">
              <h2 className="card-title">Personal Information</h2>
              <div className="profile-info">
                <div className="info-row">
                  <div className="info-label">Full Name</div>
                  <div className="info-value">{userProfile.name}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Email Address</div>
                  <div className="info-value">{userProfile.email}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">User ID</div>
                  <div className="info-value">{userProfile.userId}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Role</div>
                  <div className="info-value">
                    <span className="badge badge-info">{userProfile.role}</span>
                  </div>
                </div>
                <div className="info-row">
                  <div className="info-label">Phone Number</div>
                  <div className="info-value">{userProfile.phone}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Organization</div>
                  <div className="info-value">{userProfile.organization}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Member Since</div>
                  <div className="info-value">{userProfile.joinDate}</div>
                </div>
              </div>
              <div className="profile-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => alert('Edit Profile - Connect to backend API')}
                >
                  Edit Profile
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="card-title">Last Login Information</h2>
              <div className="login-info">
                <div className="info-row">
                  <div className="info-label">Last Login</div>
                  <div className="info-value">{userProfile.lastLogin}</div>
                </div>
                <div className="info-row">
                  <div className="info-label">Location</div>
                  <div className="info-value">{userProfile.loginLocation}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="profile-content">
            <div className="card">
              <h2 className="card-title">Change Password</h2>
              {!showPasswordForm ? (
                <div className="password-section">
                  <p className="info-text">
                    Click the button below to change your password. You will be required to enter your current password.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form className="password-form">
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Enter new password"
                      required
                    />
                    <p className="form-hint">
                      Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('Password update - Connect to backend API')
                      setShowPasswordForm(false)
                    }}
                  >
                    Update Password
                  </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="card">
              <h2 className="card-title">Security Settings</h2>
              <div className="security-settings">
                <div className="setting-item">
                  <div className="setting-content">
                    <h4 className="setting-name">Two-Factor Authentication</h4>
                    <p className="setting-desc">Add an extra layer of security to your account</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-content">
                    <h4 className="setting-name">Session Timeout</h4>
                    <p className="setting-desc">Automatically log out after 30 minutes of inactivity</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <div className="setting-item">
                  <div className="setting-content">
                    <h4 className="setting-name">Email Notifications</h4>
                    <p className="setting-desc">Receive security alerts via email</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="profile-content">
            <div className="card">
              <h2 className="card-title">Login Activity History</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Location</th>
                      <th>IP Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loginHistory.map(activity => (
                      <tr key={activity.id}>
                        <td>{activity.date}</td>
                        <td>{activity.time}</td>
                        <td>{activity.location}</td>
                        <td>{activity.ip}</td>
                        <td>
                          <span className={`badge ${activity.status === 'Success' ? 'badge-success' : 'badge-danger'}`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <div className="logout-section">
          <div className="card logout-card">
            <h3 className="logout-title">Sign Out</h3>
            <p className="logout-text">Sign out from your account securely</p>
            <Link to="/login" className="btn btn-outline btn-logout">
              Logout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

