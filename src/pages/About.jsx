import React from 'react'
import './About.css'

const About = () => {
  return (
    <div className="about-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">About GM Finance (GM One)</h1>
          <p className="page-subtitle">Secure Audit & CA Management Portal</p>
        </div>

        <div className="about-content">
          <div className="card">
            <h2 className="card-title">Our Mission</h2>
            <p className="about-text">
              GM Finance (GM One) is a comprehensive, secure, and user-friendly platform designed 
              to streamline audit and compliance management for Chartered Accountants, Auditors, 
              and their clients. We provide a government-grade solution that ensures data security, 
              compliance, and efficient workflow management.
            </p>
          </div>

          <div className="card">
            <h2 className="card-title">Key Features</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <h3>Secure Access</h3>
                <p>Multi-factor authentication and role-based access control</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📁</div>
                <h3>Document Management</h3>
                <p>Secure encrypted storage for all audit documents</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">✅</div>
                <h3>Audit Readiness</h3>
                <p>Comprehensive checklist and tracking system</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">👥</div>
                <h3>Client Management</h3>
                <p>Efficient client and entity management</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Contact Information</h2>
            <div className="contact-info">
              <div className="contact-item">
                <strong>Email:</strong> support@gmfinance.com
              </div>
              <div className="contact-item">
                <strong>Phone:</strong> +91 1800-XXX-XXXX
              </div>
              <div className="contact-item">
                <strong>Address:</strong> GM Finance & Associates, India
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

