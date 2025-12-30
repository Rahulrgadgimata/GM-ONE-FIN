import React from 'react'
import { Link } from 'react-router-dom'
import './Help.css'

const Help = () => {
  const faqs = [
    {
      question: 'How do I login to the portal?',
      answer: 'You can login using your PAN, Aadhaar, CA ID, or Staff ID. Click the Login button in the header and enter your credentials.'
    },
    {
      question: 'How do I upload documents?',
      answer: 'Navigate to Document Vault, select your client and assessment year, choose a document type, and click Upload Documents.'
    },
    {
      question: 'What is Audit Readiness?',
      answer: 'Audit Readiness helps you track all required documents for audit. It shows completion status and missing documents.'
    },
    {
      question: 'How do I submit a grievance?',
      answer: 'Go to the Grievance page from the navigation menu, fill out the form with your issue details, and submit.'
    },
    {
      question: 'Can I track my grievance status?',
      answer: 'Yes, you can view all your submitted grievances and their status on the Grievance page.'
    }
  ]

  return (
    <div className="help-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Help & Support</h1>
          <p className="page-subtitle">Find answers to common questions and get support</p>
        </div>

        <div className="help-content">
          <div className="card">
            <h2 className="card-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3 className="faq-question">{faq.question}</h3>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Quick Links</h2>
            <div className="quick-links">
              <Link to="/grievance" className="quick-link">
                <span className="link-icon">📝</span>
                <span>Submit Grievance</span>
              </Link>
              <Link to="/documents" className="quick-link">
                <span className="link-icon">📁</span>
                <span>Document Vault</span>
              </Link>
              <Link to="/audit-readiness" className="quick-link">
                <span className="link-icon">✅</span>
                <span>Audit Readiness</span>
              </Link>
              <Link to="/profile" className="quick-link">
                <span className="link-icon">👤</span>
                <span>My Profile</span>
              </Link>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Need More Help?</h2>
            <div className="support-options">
              <div className="support-option">
                <h3>📞 Phone Support</h3>
                <p>+91 1800-XXX-XXXX</p>
                <p className="support-time">Mon-Fri, 9 AM - 6 PM</p>
              </div>
              <div className="support-option">
                <h3>✉️ Email Support</h3>
                <p>support@gmfinance.com</p>
                <p className="support-time">Response within 24 hours</p>
              </div>
              <div className="support-option">
                <h3>💬 Live Chat</h3>
                <p>Available on portal</p>
                <p className="support-time">Mon-Fri, 10 AM - 5 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help

