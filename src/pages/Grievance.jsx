import React, { useState } from 'react'
import './Grievance.css'

const Grievance = () => {
  const [formData, setFormData] = useState({
    name: '',
    userId: '',
    email: '',
    phone: '',
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    attachments: []
  })

  const [submitted, setSubmitted] = useState(false)
  const [grievances, setGrievances] = useState([
    {
      id: 1,
      ticketId: 'GRV-2024-001',
      subject: 'Unable to upload documents',
      category: 'Technical Issue',
      status: 'Open',
      priority: 'High',
      submittedDate: '2024-01-10',
      lastUpdated: '2024-01-12'
    },
    {
      id: 2,
      ticketId: 'GRV-2024-002',
      subject: 'Request for access to client data',
      category: 'Access Request',
      status: 'In Progress',
      priority: 'Medium',
      submittedDate: '2024-01-08',
      lastUpdated: '2024-01-11'
    },
    {
      id: 3,
      ticketId: 'GRV-2024-003',
      subject: 'Clarification on audit process',
      category: 'Query',
      status: 'Resolved',
      priority: 'Low',
      submittedDate: '2024-01-05',
      lastUpdated: '2024-01-09'
    }
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Generate ticket ID
    const ticketId = `GRV-2024-${String(grievances.length + 1).padStart(3, '0')}`
    
    const newGrievance = {
      id: grievances.length + 1,
      ticketId: ticketId,
      subject: formData.subject,
      category: formData.category,
      status: 'Open',
      priority: formData.priority,
      submittedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    }
    
    setGrievances([newGrievance, ...grievances])
    setSubmitted(true)
    
    // Reset form
    setTimeout(() => {
      setFormData({
        name: '',
        userId: '',
        email: '',
        phone: '',
        category: '',
        subject: '',
        description: '',
        priority: 'medium',
        attachments: []
      })
      setSubmitted(false)
    }, 3000)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Open': 'badge-warning',
      'In Progress': 'badge-info',
      'Resolved': 'badge-success',
      'Closed': 'badge-danger'
    }
    return statusMap[status] || 'badge-info'
  }

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      'High': 'badge-danger',
      'Medium': 'badge-warning',
      'Low': 'badge-info'
    }
    return priorityMap[priority] || 'badge-info'
  }

  return (
    <div className="grievance-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Grievance & Support</h1>
          <p className="page-subtitle">Submit your grievances, queries, or technical issues</p>
        </div>

        {submitted && (
          <div className="success-alert">
            <div className="alert-content">
              <span className="alert-icon">✓</span>
              <div>
                <h3>Grievance Submitted Successfully!</h3>
                <p>Your ticket has been created. You will receive updates via email.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grievance-layout">
          <div className="grievance-form-section">
            <div className="card">
              <h2 className="card-title">Submit New Grievance</h2>
              <form onSubmit={handleSubmit} className="grievance-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      className="form-input"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">User ID <span className="required">*</span></label>
                    <input
                      type="text"
                      name="userId"
                      className="form-input"
                      placeholder="PAN / Aadhaar / CA ID"
                      value={formData.userId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email Address <span className="required">*</span></label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category <span className="required">*</span></label>
                    <select
                      name="category"
                      className="form-input"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="Access Request">Access Request</option>
                      <option value="Query">Query</option>
                      <option value="Complaint">Complaint</option>
                      <option value="Suggestion">Suggestion</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority <span className="required">*</span></label>
                    <select
                      name="priority"
                      className="form-input"
                      value={formData.priority}
                      onChange={handleChange}
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject <span className="required">*</span></label>
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    placeholder="Brief description of your grievance"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description <span className="required">*</span></label>
                  <textarea
                    name="description"
                    className="form-textarea"
                    rows="6"
                    placeholder="Provide detailed description of your grievance, issue, or query..."
                    value={formData.description}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Attachments (Optional)</label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="file-upload"
                      className="file-input"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <label htmlFor="file-upload" className="file-upload-label">
                      <span className="upload-icon">📎</span>
                      <span>Click to upload or drag and drop</span>
                      <span className="file-hint">PDF, DOC, JPG, PNG (Max 5MB each)</span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Submit Grievance
                  </button>
                  <button type="reset" className="btn btn-secondary">
                    Reset Form
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="grievance-list-section">
            <div className="card">
              <h2 className="card-title">My Grievances</h2>
              <div className="grievances-list">
                {grievances.length > 0 ? (
                  grievances.map(grievance => (
                    <div key={grievance.id} className="grievance-item">
                      <div className="grievance-header">
                        <div className="grievance-id">
                          <strong>Ticket ID:</strong> {grievance.ticketId}
                        </div>
                        <div className="grievance-badges">
                          <span className={`badge ${getStatusBadge(grievance.status)}`}>
                            {grievance.status}
                          </span>
                          <span className={`badge ${getPriorityBadge(grievance.priority)}`}>
                            {grievance.priority}
                          </span>
                        </div>
                      </div>
                      <h3 className="grievance-subject">{grievance.subject}</h3>
                      <div className="grievance-meta">
                        <span><strong>Category:</strong> {grievance.category}</span>
                        <span><strong>Submitted:</strong> {grievance.submittedDate}</span>
                        <span><strong>Last Updated:</strong> {grievance.lastUpdated}</span>
                      </div>
                      <div className="grievance-actions">
                        <button className="btn btn-outline btn-sm">View Details</button>
                        <button className="btn btn-outline btn-sm">Track Status</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-grievances">
                    <p>No grievances submitted yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="help-section">
          <div className="card">
            <h2 className="card-title">Need Immediate Help?</h2>
            <div className="help-options">
              <div className="help-option">
                <div className="help-icon">📞</div>
                <div className="help-content">
                  <h3>Phone Support</h3>
                  <p>+91 1800-XXX-XXXX</p>
                  <p className="help-time">Mon-Fri, 9 AM - 6 PM</p>
                </div>
              </div>
              <div className="help-option">
                <div className="help-icon">✉️</div>
                <div className="help-content">
                  <h3>Email Support</h3>
                  <p>support@gmfinance.com</p>
                  <p className="help-time">Response within 24 hours</p>
                </div>
              </div>
              <div className="help-option">
                <div className="help-icon">💬</div>
                <div className="help-content">
                  <h3>Live Chat</h3>
                  <p>Available on portal</p>
                  <p className="help-time">Mon-Fri, 10 AM - 5 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Grievance

