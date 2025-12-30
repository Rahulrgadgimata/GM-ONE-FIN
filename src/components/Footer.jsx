import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-column">
            <h3 className="footer-title">About GM Finance</h3>
            <ul className="footer-links">
              <li><a href="#about">About Us</a></li>
              <li><a href="#mission">Our Mission</a></li>
              <li><a href="#vision">Vision</a></li>
              <li><a href="#team">Team</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Contact & Help</h3>
            <ul className="footer-links">
              <li><a href="#support">Support Center</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#help">Help Desk</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Using the Portal</h3>
            <ul className="footer-links">
              <li><a href="#guide">User Guide</a></li>
              <li><a href="#tutorials">Tutorials</a></li>
              <li><a href="#video">Video Guides</a></li>
              <li><a href="#downloads">Downloads</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Security & Policies</h3>
            <ul className="footer-links">
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#security">Security Policy</a></li>
              <li><a href="#compliance">Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; GM Finance (GM One). All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

