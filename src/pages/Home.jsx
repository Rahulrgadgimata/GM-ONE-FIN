import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  return (
    <div className="home-page">
      <div className="page-container">
        <div className="home-hero">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to GM Finance (GM One)</h1>
            <p className="hero-description">
              A secure, role-based audit and CA management portal designed for 
              professional compliance and financial management.
            </p>
          </div>
        </div>

        <div className="services-section">
          <h2 className="section-title">Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📋</div>
              <h3 className="service-title">Client Management</h3>
              <p className="service-description">
                Comprehensive client and entity management with secure access controls.
              </p>
              <Link to="/clients" className="service-link">Manage Clients →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">🔒</div>
              <h3 className="service-title">Document Vault</h3>
              <p className="service-description">
                Secure encrypted storage for all audit documents and compliance files.
              </p>
              <Link to="/documents" className="service-link">Access Vault →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">✅</div>
              <h3 className="service-title">Audit Readiness</h3>
              <p className="service-description">
                Track and manage audit requirements with comprehensive checklists.
              </p>
              <Link to="/audit-readiness" className="service-link">Check Status →</Link>
            </div>

            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3 className="service-title">Filing & Compliance</h3>
              <p className="service-description">
                Streamlined filing processes with automated compliance tracking.
              </p>
              <Link to="/dashboard" className="service-link">View Dashboard →</Link>
            </div>
          </div>
        </div>

        <div className="trust-section">
          <h2 className="section-title">Trust & Security</h2>
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">🔐</div>
              <h4 className="trust-title">Secure Access</h4>
              <p className="trust-text">Multi-factor authentication and role-based access control</p>
            </div>

            <div className="trust-item">
              <div className="trust-icon">🛡️</div>
              <h4 className="trust-title">Encrypted Storage</h4>
              <p className="trust-text">End-to-end encryption for all sensitive documents</p>
            </div>

            <div className="trust-item">
              <div className="trust-icon">👥</div>
              <h4 className="trust-title">Role-Based Control</h4>
              <p className="trust-text">Granular permissions for Auditors, CAs, and Staff</p>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <div className="cta-card">
            <h3 className="cta-title">Ready to Get Started?</h3>
            <p className="cta-text">Access your secure portal to manage audits and compliance</p>
            <div className="cta-buttons">
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
              <Link to="/grievance" className="btn btn-secondary">Submit Grievance</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

