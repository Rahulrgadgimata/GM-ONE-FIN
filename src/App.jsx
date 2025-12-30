import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ClientManagement from './pages/ClientManagement'
import DocumentVault from './pages/DocumentVault'
import AuditReadiness from './pages/AuditReadiness'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import Grievance from './pages/Grievance'
import About from './pages/About'
import Help from './pages/Help'
import Contact from './pages/Contact'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<ClientManagement />} />
          <Route path="/documents" element={<DocumentVault />} />
          <Route path="/audit-readiness" element={<AuditReadiness />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/grievance" element={<Grievance />} />
          <Route path="/about" element={<About />} />
          <Route path="/help" element={<Help />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App

