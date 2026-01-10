import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import styles from '../styles/Vault.module.css'

export default function DocumentVault() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [vault, setVault] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState('')
  const [selectedYear, setSelectedYear] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchVault()
  }, [isAuthenticated, selectedEntity, selectedYear])

  const fetchVault = async () => {
    try {
      const queryParams = []
      if (selectedEntity) queryParams.push(`entity_id=${selectedEntity}`)
      if (selectedYear) queryParams.push(`financial_year=${selectedYear}`)
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''
      const res = await api.get(`/documents/vault${queryString}`)
      console.log('Vault API response:', res.data)
      alert('Vault API response: ' + JSON.stringify(res.data))
      const data = res.data as { vault: any[] }
      setVault(data.vault || [])
    } catch (error) {
      console.error('Failed to fetch vault:', error)
      alert('Failed to fetch vault: ' + JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }

  const downloadDocument = async (docId: number, fileName: string, docType: string = 'periodic') => {
    try {
      const token = localStorage.getItem('token')
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/${docType}/${docId}/download`
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
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(blobUrl)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        alert(errorData.error || 'Failed to download document')
      }
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download document')
    }
  }

  const viewDocument = async (docId: number, docType: string = 'periodic') => {
    try {
      const token = localStorage.getItem('token')
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/documents/${docType}/${docId}/view`
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
      console.error('View failed:', error)
      alert('Failed to view document')
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
        <title>Document Vault - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Document Vault</h1>
          <p className={styles.subtitle}>View and download all documents organized by entity, year, and period</p>

          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              <option value="">All Entities</option>
              {vault.map(entity => (
                <option key={entity.entity_id} value={entity.entity_id}>
                  {entity.entity_name}
                </option>
              ))}
            </select>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Filter by Financial Year (e.g., 2023-24)"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            />
          </div>

          {vault.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No documents found</p>
            </div>
          ) : (
            vault.map(entity => (
              <div key={entity.entity_id} className={styles.entitySection}>
                <h2 className={styles.entityName}>{entity.entity_name}</h2>
                {Object.keys(entity.documents_by_year).length === 0 ? (
                  <p className={styles.noDocs}>No documents for this entity</p>
                ) : (
                  Object.entries(entity.documents_by_year).map(([year, periods]: [string, any]) => (
                    <div key={year} className={styles.yearSection}>
                      <h3 className={styles.yearTitle}>Financial Year: {year}</h3>
                      {Object.entries(periods).map(([periodKey, docs]: [string, any]) => (
                        <div key={periodKey} className={styles.periodSection}>
                          <h4 className={styles.periodTitle}>{periodKey.replace('_', ' ')}</h4>
                          <div className={styles.documentsGrid}>
                            {docs.map((doc: any) => (
                              <div key={doc.id} className={styles.documentCard}>
                                <div className={styles.documentInfo}>
                                  <strong>{doc.document_type}</strong>
                                  <p>{doc.file_name}</p>
                                  <small>Version {doc.version} • {new Date(doc.uploaded_at).toLocaleDateString()}</small>
                                </div>
                                <div className={styles.documentActions}>
                                  <button
                                    className={styles.viewBtn}
                                    onClick={() => viewDocument(doc.id, 'periodic')}
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    className={styles.downloadBtn}
                                    onClick={() => downloadDocument(doc.id, doc.file_name, 'periodic')}
                                  >
                                    ⬇️ Download
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  )
}

