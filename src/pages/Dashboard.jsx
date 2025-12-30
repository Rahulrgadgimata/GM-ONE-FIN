import React, { useState } from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const [userRole] = useState('auditor') // Can be 'auditor', 'ca', or 'staff'

  const stats = {
    auditor: {
      totalClients: 156,
      pendingAudits: 23,
      missingDocuments: 12,
      upcomingDueDates: 8
    },
    ca: {
      totalClients: 45,
      pendingAudits: 7,
      missingDocuments: 5,
      upcomingDueDates: 3
    },
    staff: {
      totalClients: 12,
      pendingAudits: 4,
      missingDocuments: 2,
      upcomingDueDates: 1
    }
  }

  const currentStats = stats[userRole]

  const recentActivities = [
    { id: 1, action: 'Document uploaded', client: 'ABC Corp', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Audit completed', client: 'XYZ Ltd', time: '5 hours ago', type: 'success' },
    { id: 3, action: 'Document pending', client: 'DEF Industries', time: '1 day ago', type: 'warning' },
    { id: 4, action: 'New client added', client: 'GHI Pvt Ltd', time: '2 days ago', type: 'info' },
    { id: 5, action: 'Compliance alert', client: 'JKL Corp', time: '3 days ago', type: 'warning' }
  ]

  const upcomingDueDates = [
    { id: 1, client: 'ABC Corp', dueDate: '2024-01-15', type: 'Filing', priority: 'high' },
    { id: 2, client: 'XYZ Ltd', dueDate: '2024-01-18', type: 'Audit', priority: 'medium' },
    { id: 3, client: 'DEF Industries', dueDate: '2024-01-20', type: 'Compliance', priority: 'high' },
    { id: 4, client: 'GHI Pvt Ltd', dueDate: '2024-01-22', type: 'Filing', priority: 'low' }
  ]

  return (
    <div className="dashboard-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Welcome back! Here's an overview of your audit and compliance activities.
          </p>
        </div>

        <div className="role-badge">
          <span className="badge badge-info">
            Logged in as: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </span>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3 className="stat-value">{currentStats.totalClients}</h3>
              <p className="stat-label">Total Clients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-value">{currentStats.pendingAudits}</h3>
              <p className="stat-label">Pending Audits</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3 className="stat-value">{currentStats.missingDocuments}</h3>
              <p className="stat-label">Missing Documents</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3 className="stat-value">{currentStats.upcomingDueDates}</h3>
              <p className="stat-label">Upcoming Due Dates</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-section">
            <div className="card">
              <h2 className="card-title">Recent Activity</h2>
              <div className="activity-list">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon activity-${activity.type}`}>
                      {activity.type === 'success' ? '✓' : activity.type === 'warning' ? '⚠' : 'ℹ'}
                    </div>
                    <div className="activity-content">
                      <p className="activity-action">{activity.action}</p>
                      <p className="activity-details">{activity.client} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="card">
              <h2 className="card-title">Upcoming Due Dates</h2>
              <div className="due-dates-list">
                {upcomingDueDates.map(item => (
                  <div key={item.id} className="due-date-item">
                    <div className="due-date-content">
                      <h4 className="due-date-client">{item.client}</h4>
                      <p className="due-date-type">{item.type}</p>
                      <p className="due-date-date">Due: {item.dueDate}</p>
                    </div>
                    <span className={`badge badge-${item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'info'}`}>
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <div className="card">
            <h2 className="card-title">Quick Actions</h2>
            <div className="actions-grid">
              <a href="/clients" className="action-btn">
                <span className="action-icon">👥</span>
                <span className="action-text">Manage Clients</span>
              </a>
              <a href="/documents" className="action-btn">
                <span className="action-icon">📁</span>
                <span className="action-text">Document Vault</span>
              </a>
              <a href="/audit-readiness" className="action-btn">
                <span className="action-icon">✅</span>
                <span className="action-text">Audit Readiness</span>
              </a>
              <a href="/notifications" className="action-btn">
                <span className="action-icon">🔔</span>
                <span className="action-text">Notifications</span>
              </a>
              <a href="/grievance" className="action-btn">
                <span className="action-icon">📝</span>
                <span className="action-text">Grievance</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

