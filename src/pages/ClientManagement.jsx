import React, { useState } from 'react'
import './ClientManagement.css'

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const clients = [
    { id: 1, pan: 'ABCDE1234F', name: 'ABC Corporation', entityType: 'Company', year: '2023-24', status: 'Active' },
    { id: 2, pan: 'FGHIJ5678K', name: 'XYZ Private Limited', entityType: 'Private Ltd', year: '2023-24', status: 'Active' },
    { id: 3, pan: 'LMNOP9012Q', name: 'DEF Industries', entityType: 'Partnership', year: '2023-24', status: 'Pending' },
    { id: 4, pan: 'RSTUV3456W', name: 'GHI Trading Co.', entityType: 'Sole Proprietorship', year: '2023-24', status: 'Active' },
    { id: 5, pan: 'XYZAB7890C', name: 'JKL Services', entityType: 'LLP', year: '2023-24', status: 'Inactive' },
    { id: 6, pan: 'DEFGH1234I', name: 'MNO Enterprises', entityType: 'Company', year: '2023-24', status: 'Active' },
    { id: 7, pan: 'JKLMN5678O', name: 'PQR Solutions', entityType: 'Private Ltd', year: '2023-24', status: 'Pending' },
    { id: 8, pan: 'STUVW9012X', name: 'UVW Group', entityType: 'Company', year: '2023-24', status: 'Active' },
    { id: 9, pan: 'YZABC3456D', name: 'BCD Holdings', entityType: 'LLP', year: '2023-24', status: 'Active' },
    { id: 10, pan: 'EFGHI7890J', name: 'HIJ Associates', entityType: 'Partnership', year: '2023-24', status: 'Active' },
    { id: 11, pan: 'KLMNO1234P', name: 'OPQ Industries', entityType: 'Company', year: '2023-24', status: 'Pending' },
    { id: 12, pan: 'QRSTU5678Y', name: 'TUV Corporation', entityType: 'Private Ltd', year: '2023-24', status: 'Active' }
  ]

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.pan.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || client.status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status) => {
    const statusClass = {
      'Active': 'badge-success',
      'Pending': 'badge-warning',
      'Inactive': 'badge-danger'
    }
    return statusClass[status] || 'badge-info'
  }

  return (
    <div className="client-management-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Client & Entity Management</h1>
          <p className="page-subtitle">Manage your clients and entities efficiently</p>
        </div>

        <div className="client-actions">
          <div className="search-filter-bar">
            <div className="search-box">
              <input
                type="text"
                className="form-input search-input"
                placeholder="Search by Client Name or PAN..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
            <div className="filter-box">
              <select
                className="form-input filter-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => alert('Add New Client functionality - Connect to backend API')}
            >
              + Add New Client
            </button>
          </div>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>PAN</th>
                <th>Client Name</th>
                <th>Entity Type</th>
                <th>Assessment Year</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length > 0 ? (
                paginatedClients.map(client => (
                  <tr key={client.id}>
                    <td>{client.pan}</td>
                    <td><strong>{client.name}</strong></td>
                    <td>{client.entityType}</td>
                    <td>{client.year}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-action btn-view" 
                          title="View"
                          onClick={() => alert(`View details for ${client.name}`)}
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-action btn-edit" 
                          title="Edit"
                          onClick={() => alert(`Edit ${client.name}`)}
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-action btn-delete" 
                          title="Delete"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${client.name}?`)) {
                              alert('Delete functionality - Connect to backend API')
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    No clients found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages} ({filteredClients.length} clients)
            </span>
            <button
              className="btn btn-outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientManagement

