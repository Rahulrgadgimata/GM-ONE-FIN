import React, { useState } from 'react'
import './DocumentVault.css'

const DocumentVault = () => {
  const [selectedClient, setSelectedClient] = useState('ABC Corporation')
  const [selectedYear, setSelectedYear] = useState('2023-24')
  const [selectedFolder, setSelectedFolder] = useState(null)

  const clients = ['ABC Corporation', 'XYZ Private Limited', 'DEF Industries', 'GHI Trading Co.']
  const years = ['2023-24', '2022-23', '2021-22', '2020-21']

  const documentTypes = [
    { id: 1, name: 'Financial Statements', count: 12, status: 'verified' },
    { id: 2, name: 'Tax Returns', count: 8, status: 'uploaded' },
    { id: 3, name: 'Audit Reports', count: 5, status: 'verified' },
    { id: 4, name: 'Supporting Documents', count: 23, status: 'pending' },
    { id: 5, name: 'Compliance Certificates', count: 4, status: 'verified' },
    { id: 6, name: 'Bank Statements', count: 15, status: 'uploaded' }
  ]

  const documents = selectedFolder ? [
    { id: 1, name: 'Balance Sheet 2023-24.pdf', size: '2.4 MB', uploaded: '2024-01-10', status: 'verified' },
    { id: 2, name: 'Profit & Loss Statement.pdf', size: '1.8 MB', uploaded: '2024-01-10', status: 'verified' },
    { id: 3, name: 'Cash Flow Statement.pdf', size: '1.2 MB', uploaded: '2024-01-11', status: 'uploaded' },
    { id: 4, name: 'Notes to Accounts.pdf', size: '3.1 MB', uploaded: '2024-01-11', status: 'pending' }
  ] : []

  const getStatusBadge = (status) => {
    const statusMap = {
      'verified': 'badge-success',
      'uploaded': 'badge-info',
      'pending': 'badge-warning'
    }
    return statusMap[status] || 'badge-info'
  }

  return (
    <div className="document-vault-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Document Vault</h1>
          <p className="page-subtitle">Secure document storage and management</p>
        </div>

        <div className="vault-controls">
          <div className="control-group">
            <label className="form-label">Select Client</label>
            <select
              className="form-input"
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value)
                setSelectedFolder(null)
              }}
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
              onChange={(e) => {
                setSelectedYear(e.target.value)
                setSelectedFolder(null)
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <button 
              className="btn btn-primary"
              onClick={() => alert('Upload Documents - Connect to file upload API')}
            >
              📤 Upload Documents
            </button>
          </div>
        </div>

        <div className="vault-layout">
          <div className="folder-panel">
            <div className="card">
              <h2 className="card-title">Document Types</h2>
              <div className="folder-list">
                {documentTypes.map(type => (
                  <div
                    key={type.id}
                    className={`folder-item ${selectedFolder === type.id ? 'active' : ''}`}
                    onClick={() => setSelectedFolder(type.id)}
                  >
                    <div className="folder-icon">📁</div>
                    <div className="folder-content">
                      <h4 className="folder-name">{type.name}</h4>
                      <p className="folder-count">{type.count} documents</p>
                      <span className={`badge ${getStatusBadge(type.status)}`}>
                        {type.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="document-panel">
            <div className="card">
              <div className="document-header">
                <h2 className="card-title">
                  {selectedFolder 
                    ? documentTypes.find(t => t.id === selectedFolder)?.name 
                    : 'Select a document type to view files'}
                </h2>
                {selectedFolder && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => alert('Add Document - Connect to file upload API')}
                  >
                    + Add Document
                  </button>
                )}
              </div>

              {selectedFolder ? (
                <div className="document-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Size</th>
                        <th>Uploaded On</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id}>
                          <td>
                            <div className="doc-name">
                              <span className="doc-icon">📄</span>
                              {doc.name}
                            </div>
                          </td>
                          <td>{doc.size}</td>
                          <td>{doc.uploaded}</td>
                          <td>
                            <span className={`badge ${getStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-action btn-view" 
                                title="View"
                                onClick={() => alert(`View ${doc.name}`)}
                              >
                                👁️
                              </button>
                              <button 
                                className="btn-action btn-download" 
                                title="Download"
                                onClick={() => alert(`Download ${doc.name} - Connect to download API`)}
                              >
                                ⬇️
                              </button>
                              <button 
                                className="btn-action btn-delete" 
                                title="Delete"
                                onClick={() => {
                                  if (window.confirm(`Delete ${doc.name}?`)) {
                                    alert('Delete functionality - Connect to backend API')
                                  }
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">📁</div>
                  <p className="empty-text">Select a document type from the left panel to view files</p>
                </div>
              )}
            </div>

            {selectedFolder && (
              <div className="card">
                <h3 className="card-title">Version History</h3>
                <p className="info-text">Version history will be displayed here for selected documents.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DocumentVault

