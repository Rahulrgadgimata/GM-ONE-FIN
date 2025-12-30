import React, { useState } from 'react'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Contact form submitted - Connect to backend API')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  return (
    <div className="contact-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Contact Us</h1>
          <p className="page-subtitle">Get in touch with our support team</p>
        </div>

        <div className="contact-layout">
          <div className="contact-form-section">
            <div className="card">
              <h2 className="card-title">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

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

                <div className="form-group">
                  <label className="form-label">Subject <span className="required">*</span></label>
                  <input
                    type="text"
                    name="subject"
                    className="form-input"
                    placeholder="What is this regarding?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message <span className="required">*</span></label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    rows="6"
                    placeholder="Enter your message..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Send Message
                  </button>
                  <button type="reset" className="btn btn-secondary">
                    Clear
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="contact-info-section">
            <div className="card">
              <h2 className="card-title">Contact Information</h2>
              <div className="contact-details">
                <div className="contact-detail-item">
                  <div className="detail-icon">📧</div>
                  <div className="detail-content">
                    <h3>Email</h3>
                    <p>support@gmfinance.com</p>
                    <p>info@gmfinance.com</p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="detail-icon">📞</div>
                  <div className="detail-content">
                    <h3>Phone</h3>
                    <p>+91 1800-XXX-XXXX</p>
                    <p>+91 1800-XXX-YYYY</p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="detail-icon">📍</div>
                  <div className="detail-content">
                    <h3>Address</h3>
                    <p>GM Finance & Associates</p>
                    <p>Mumbai, Maharashtra</p>
                    <p>India - 400001</p>
                  </div>
                </div>

                <div className="contact-detail-item">
                  <div className="detail-icon">🕒</div>
                  <div className="detail-content">
                    <h3>Business Hours</h3>
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 2:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact

