import React, { useState } from 'react'
import './Notifications.css'

const Notifications = () => {
  const [filter, setFilter] = useState('all') // all, unread, read

  const notifications = [
    { 
      id: 1, 
      type: 'document', 
      title: 'Document Upload Required', 
      message: 'Missing documents for ABC Corporation - Assessment Year 2023-24',
      time: '2 hours ago',
      read: false,
      priority: 'high'
    },
    { 
      id: 2, 
      type: 'due_date', 
      title: 'Due Date Approaching', 
      message: 'Filing deadline for XYZ Private Limited is in 3 days',
      time: '5 hours ago',
      read: false,
      priority: 'high'
    },
    { 
      id: 3, 
      type: 'upload', 
      title: 'Document Upload Confirmed', 
      message: 'Balance Sheet for DEF Industries has been successfully uploaded',
      time: '1 day ago',
      read: true,
      priority: 'medium'
    },
    { 
      id: 4, 
      type: 'security', 
      title: 'Security Alert', 
      message: 'New login detected from a different device',
      time: '2 days ago',
      read: true,
      priority: 'high'
    },
    { 
      id: 5, 
      type: 'audit', 
      title: 'Audit Completed', 
      message: 'Audit for GHI Trading Co. has been completed successfully',
      time: '3 days ago',
      read: true,
      priority: 'medium'
    },
    { 
      id: 6, 
      type: 'compliance', 
      title: 'Compliance Reminder', 
      message: 'GST return filing due for JKL Services in 5 days',
      time: '4 days ago',
      read: true,
      priority: 'medium'
    },
    { 
      id: 7, 
      type: 'document', 
      title: 'Document Verified', 
      message: 'Tax Return for MNO Enterprises has been verified',
      time: '5 days ago',
      read: true,
      priority: 'low'
    },
    { 
      id: 8, 
      type: 'system', 
      title: 'System Maintenance', 
      message: 'Scheduled maintenance on January 20, 2024 from 2 AM to 4 AM',
      time: '1 week ago',
      read: true,
      priority: 'low'
    }
  ]

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.read)

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type) => {
    const icons = {
      'document': '📄',
      'due_date': '📅',
      'upload': '✅',
      'security': '🔒',
      'audit': '📋',
      'compliance': '⚖️',
      'system': '⚙️'
    }
    return icons[type] || '🔔'
  }

  const getPriorityClass = (priority) => {
    const classes = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    }
    return classes[priority] || 'priority-medium'
  }

  const markAsRead = (id) => {
    // In real app, this would update the notification state via API
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    )
    // This would be handled by state management in real app
    alert(`Notification ${id} marked as read - Connect to backend API`)
  }

  const markAllAsRead = () => {
    // In real app, this would mark all as read via API
    alert('All notifications marked as read - Connect to backend API')
  }

  return (
    <div className="notifications-page">
      <div className="page-container">
        <div className="page-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Notifications</h1>
              <p className="page-subtitle">Stay updated with important alerts and updates</p>
            </div>
            {unreadCount > 0 && (
              <div className="unread-badge">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        <div className="notifications-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllAsRead}>
              Mark All as Read
            </button>
          )}
        </div>

        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3 className="notification-title">{notification.title}</h3>
                    {!notification.read && <span className="unread-dot"></span>}
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-time">{notification.time}</p>
                </div>
                <div className="notification-actions">
                  <button className="btn-action" title="Mark as read">
                    {notification.read ? '✓' : '○'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-notifications">
              <div className="empty-icon">🔔</div>
              <p className="empty-text">No notifications found</p>
            </div>
          )}
        </div>

        <div className="notification-settings">
          <div className="card">
            <h2 className="card-title">Notification Settings</h2>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-content">
                  <h4 className="setting-name">Email Notifications</h4>
                  <p className="setting-desc">Receive notifications via email</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-content">
                  <h4 className="setting-name">Document Alerts</h4>
                  <p className="setting-desc">Get notified about document uploads</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-content">
                  <h4 className="setting-name">Due Date Reminders</h4>
                  <p className="setting-desc">Receive reminders for upcoming due dates</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div className="setting-content">
                  <h4 className="setting-name">Security Alerts</h4>
                  <p className="setting-desc">Get notified about security events</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications

