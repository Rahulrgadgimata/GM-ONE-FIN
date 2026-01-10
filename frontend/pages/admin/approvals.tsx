import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/AdminApprovals.module.css'

export default function AdminApprovals() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState<any>(null)
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
    fetchPendingEntities()
  }, [isAuthenticated])

  const fetchPendingEntities = async () => {
    try {
      const res = await api.get('/entities/pending')
      const data = res.data as { entities: any[] }
      const entitiesList = data.entities || []
      
      // Fetch documents for each entity
      const entitiesWithDocs = await Promise.all(
        entitiesList.map(async (entity: any) => {
          try {
            const docsRes = await api.get(`/documents/entity/${entity.id}/all`)
            const docsData = docsRes.data as { permanent_documents: any[], periodic_documents: any[] }
            return {
              ...entity,
              documents: [
                ...(docsData.permanent_documents || []).map((doc: any) => ({ ...doc, type: 'permanent' })),
                ...(docsData.periodic_documents || []).map((doc: any) => ({ ...doc, type: 'periodic' }))
              ]
            }
          } catch (error) {
            console.error(`Failed to fetch documents for entity ${entity.id}:`, error)
            return { ...entity, documents: [] }
          }
        })
      )
      
      setEntities(entitiesWithDocs)
    } catch (error) {
      console.error('Failed to fetch pending entities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (entityId: number) => {
    if (!confirm('Are you sure you want to approve this entity?')) return

    try {
      await api.post(`/entities/${entityId}/approve`, { remarks: remarks || '' })
      alert('Entity approved successfully!')
      fetchPendingEntities()
      setSelectedEntity(null)
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve entity')
    }
  }

  const handleReject = async (entityId: number) => {
    if (!remarks.trim()) {
      alert('Please provide remarks for rejection')
      return
    }

    if (!confirm('Are you sure you want to reject this entity?')) return

    try {
      await api.post(`/entities/${entityId}/reject`, { remarks })
      alert('Entity rejected')
      fetchPendingEntities()
      setSelectedEntity(null)
      setRemarks('')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject entity')
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>Loading...</div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Pending Approvals - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Pending Entity Approvals</h1>
          <p className={styles.subtitle}>Review and approve or reject pending entity submissions</p>

          {entities.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No pending entities</p>
            </div>
          ) : (
            <div className={styles.entitiesList}>
              {entities.map(entity => (
                <div key={entity.id} className={styles.entityCard}>
                  <div className={styles.entityHeader}>
                    <h2>{entity.company_name}</h2>
                    <span className={styles.status}>Pending Approval</span>
                  </div>

                  <div className={styles.entityDetails}>
                    <div className={styles.detailRow}>
                      <strong>PAN:</strong> {entity.pan}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>GSTIN:</strong> {entity.gstin}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Company Type:</strong> {entity.company_type}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Address:</strong> {entity.address}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Secretary:</strong> {entity.secretary_email || (entity.secretary?.email) || 'N/A'}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Created:</strong> {new Date(entity.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className={styles.documentsSection}>
                    <h3>Documents ({entity.documents?.length || 0})</h3>
                    {!entity.documents || entity.documents.length === 0 ? (
                      <p className={styles.noDocs}>No documents uploaded</p>
                    ) : (
                      <div className={styles.documentsList}>
                        {entity.documents?.map((doc: any) => (
                          <div key={doc.id} className={styles.documentItem}>
                            <div className={styles.documentInfo}>
                              <span className={styles.docType}>{doc.document_type}</span>
                              <span className={styles.docName}>{doc.file_name}</span>
                              <span className={styles.docSize}>
                                {(doc.file_size / 1024).toFixed(2)} KB
                              </span>
                            </div>
                            <div className={styles.documentActions}>
                              <button
                                className={styles.viewBtn}
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('token')
                                    const docType = doc.type || 'permanent'
                                    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/${docType}/${doc.id}/view`
                                    const response = await fetch(url, {
                                      headers: {
                                        'Authorization': `Bearer ${token}`
                                      }
                                    })
                                    if (response.ok) {
                                      const blob = await response.blob()
                                      const blobUrl = window.URL.createObjectURL(blob)
                                      window.open(blobUrl, '_blank')
                                    } else {
                                      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                                      alert(errorData.error || 'Failed to view document')
                                    }
                                  } catch (error) {
                                    console.error('Error viewing document:', error)
                                    alert('Error viewing document')
                                  }
                                }}
                              >
                                👁️ View
                              </button>
                              <button
                                className={styles.downloadBtn}
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('token')
                                    const docType = doc.type || 'permanent'
                                    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/${docType}/${doc.id}/download`
                                    const response = await fetch(url, {
                                      headers: {
                                        'Authorization': `Bearer ${token}`
                                      }
                                    })
                                    if (response.ok) {
                                      const blob = await response.blob()
                                      const blobUrl = window.URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = blobUrl
                                      a.download = doc.file_name
                                      document.body.appendChild(a)
                                      a.click()
                                      document.body.removeChild(a)
                                      window.URL.revokeObjectURL(blobUrl)
                                    } else {
                                      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                                      alert(errorData.error || 'Failed to download document')
                                    }
                                  } catch (error) {
                                    console.error('Error downloading document:', error)
                                    alert('Error downloading document')
                                  }
                                }}
                              >
                                ⬇️ Download
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleApprove(entity.id)}
                    >
                      Approve Entity
                    </button>
                    <div className={styles.rejectSection}>
                      <textarea
                        className={styles.remarksInput}
                        placeholder="Enter rejection remarks..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleReject(entity.id)}
                      >
                        Reject Entity
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

