import React, { useState } from 'react'
import './AuditReadiness.css'

const AuditReadiness = () => {
  const [selectedClient, setSelectedClient] = useState('ABC Corporation')
  const [selectedYear, setSelectedYear] = useState('2023-24')

  const clients = ['ABC Corporation', 'XYZ Private Limited', 'DEF Industries', 'GHI Trading Co.']
  const years = ['2023-24', '2022-23', '2021-22', '2020-21']

  const auditChecklist = [
    { id: 1, category: 'Financial Statements', items: [
      { id: 1, name: 'Balance Sheet', status: 'complete', required: true },
      { id: 2, name: 'Profit & Loss Statement', status: 'complete', required: true },
      { id: 3, name: 'Cash Flow Statement', status: 'complete', required: true },
      { id: 4, name: 'Notes to Accounts', status: 'pending', required: true }
    ]},
    { id: 2, category: 'Tax Documents', items: [
      { id: 5, name: 'Income Tax Return', status: 'complete', required: true },
      { id: 6, name: 'TDS Certificates', status: 'complete', required: true },
      { id: 7, name: 'Advance Tax Challans', status: 'pending', required: true },
      { id: 8, name: 'Tax Audit Report', status: 'complete', required: true }
    ]},
    { id: 3, category: 'Supporting Documents', items: [
      { id: 9, name: 'Bank Statements', status: 'complete', required: true },
      { id: 10, name: 'Ledger Accounts', status: 'pending', required: true },
      { id: 11, name: 'Vouchers & Invoices', status: 'complete', required: false },
      { id: 12, name: 'Fixed Assets Register', status: 'pending', required: true }
    ]},
    { id: 4, category: 'Compliance Documents', items: [
      { id: 13, name: 'GST Returns', status: 'complete', required: true },
      { id: 14, name: 'ROC Filing Documents', status: 'pending', required: true },
      { id: 15, name: 'Statutory Registers', status: 'complete', required: true },
      { id: 16, name: 'Board Resolutions', status: 'pending', required: false }
    ]}
  ]

  const getStatusIcon = (status) => {
    return status === 'complete' ? '✓' : '⚠'
  }

  const getStatusClass = (status) => {
    return status === 'complete' ? 'status-complete' : 'status-pending'
  }

  const totalItems = auditChecklist.reduce((sum, category) => sum + category.items.length, 0)
  const completedItems = auditChecklist.reduce((sum, category) => 
    sum + category.items.filter(item => item.status === 'complete').length, 0
  )
  const pendingItems = totalItems - completedItems
  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  return (
    <div className="audit-readiness-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Audit Readiness</h1>
          <p className="page-subtitle">Track and manage audit requirements</p>
        </div>

        <div className="readiness-controls">
          <div className="control-group">
            <label className="form-label">Select Client</label>
            <select
              className="form-input"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label className="form-label">Assessment Year</label>
            <select
              className="form-input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="readiness-summary">
          <div className="summary-card">
            <div className="summary-icon">📊</div>
            <div className="summary-content">
              <h3 className="summary-value">{completionPercentage}%</h3>
              <p className="summary-label">Overall Readiness</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <div className="summary-content">
              <h3 className="summary-value">{completedItems}</h3>
              <p className="summary-label">Completed Items</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⚠️</div>
            <div className="summary-content">
              <h3 className="summary-value">{pendingItems}</h3>
              <p className="summary-label">Pending Items</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📋</div>
            <div className="summary-content">
              <h3 className="summary-value">{totalItems}</h3>
              <p className="summary-label">Total Items</p>
            </div>
          </div>
        </div>

        <div className="readiness-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {completedItems} of {totalItems} items completed
          </p>
        </div>

        <div className="checklist-section">
          {auditChecklist.map(category => (
            <div key={category.id} className="checklist-category">
              <div className="card">
                <h2 className="card-title">{category.category}</h2>
                <div className="checklist-items">
                  {category.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`checklist-item ${getStatusClass(item.status)} ${!item.required ? 'optional' : ''}`}
                    >
                      <div className="item-status">
                        <span className="status-icon">{getStatusIcon(item.status)}</span>
                      </div>
                      <div className="item-content">
                        <h4 className="item-name">
                          {item.name}
                          {!item.required && <span className="optional-badge">Optional</span>}
                        </h4>
                        <p className="item-status-text">
                          Status: <strong>{item.status === 'complete' ? 'Complete' : 'Pending'}</strong>
                        </p>
                      </div>
                      <div className="item-actions">
                        {item.status === 'pending' && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => alert(`Upload ${item.name} - Connect to upload API`)}
                          >
                            Upload
                          </button>
                        )}
                        {item.status === 'complete' && (
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => alert(`View ${item.name}`)}
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="missing-documents-alert">
          <div className="card alert-card">
            <div className="alert-header">
              <span className="alert-icon">⚠️</span>
              <h3 className="alert-title">Missing Required Documents</h3>
            </div>
            <p className="alert-text">
              {pendingItems} required document{pendingItems !== 1 ? 's' : ''} {pendingItems !== 1 ? 'are' : 'is'} pending. 
              Please upload the missing documents to complete audit readiness.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => {
                const missing = auditChecklist.flatMap(cat => 
                  cat.items.filter(item => item.status === 'pending' && item.required)
                )
                alert(`Missing Documents:\n${missing.map(m => `- ${m.name}`).join('\n')}`)
              }}
            >
              View Missing Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuditReadiness

