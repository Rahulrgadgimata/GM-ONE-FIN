import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/AdminUsers.module.css'

export default function AdminUsers() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [allData, setAllData] = useState<any>({
    users: [],
    entities: [],
    documents: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
    fetchAllData()
  }, [isAuthenticated, user])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      console.log('Fetching all data for super admin...')

      // Fetch all users
      const usersRes = await api.get('/users')
      const users = usersRes.data?.users || []

      // Fetch all entities
      const entitiesRes = await api.get('/entities/my-entities')
      const entities = entitiesRes.data?.entities || []

      // Fetch all documents
      const periodicRes = await api.get('/documents/vault')
      const permanentRes = await api.get('/documents/permanent/all')
      const documents = [
        ...(periodicRes.data?.vault || []),
        ...(permanentRes.data?.documents || [])
      ]

      console.log('Fetched data:', { users: users.length, entities: entities.length, documents: documents.length })
      setAllData({ users, entities, documents })
    } catch (error: any) {
      console.error('Failed to fetch all data:', error)
      alert(`Error fetching data: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>Loading all data...</div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>All System Data - Admin - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>All System Data</h1>
              <p className={styles.subtitle}>Complete overview of all users, entities, and documents</p>
            </div>
            <button onClick={fetchAllData} className={styles.refreshBtn}>
              🔄 Refresh All Data
            </button>
          </div>

          {/* Statistics */}
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Total Users</h3>
              <p className={styles.statNumber}>{allData.users.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Entities</h3>
              <p className={styles.statNumber}>{allData.entities.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Total Documents</h3>
              <p className={styles.statNumber}>{allData.documents.length}</p>
            </div>
          </div>

          {/* All Users */}
          <div className={styles.section}>
            <h2>All Users ({allData.users.length})</h2>
            {allData.users.length === 0 ? (
              <p>No users found</p>
            ) : (
              <div className={styles.dataGrid}>
                {allData.users.map((u: any) => (
                  <div key={u.id} className={styles.dataCard}>
                    <h3>{u.email}</h3>
                    <p>Role: {u.role}</p>
                    <p>PAN: {u.pan || 'N/A'}</p>
                    <p>GSTIN: {u.gstin || 'N/A'}</p>
                    <p>Status: {u.is_active ? 'Active' : 'Inactive'}</p>
                    <p>Created: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Entities */}
          <div className={styles.section}>
            <h2>All Entities ({allData.entities.length})</h2>
            {allData.entities.length === 0 ? (
              <p>No entities found</p>
            ) : (
              <div className={styles.dataGrid}>
                {allData.entities.map((e: any) => (
                  <div key={e.id} className={styles.dataCard}>
                    <h3>{e.company_name}</h3>
                    <p>PAN: {e.pan}</p>
                    <p>GSTIN: {e.gstin}</p>
                    <p>Type: {e.company_type}</p>
                    <p>Status: {e.status}</p>
                    <p>Address: {e.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* All Documents */}
          <div className={styles.section}>
            <h2>All Documents ({allData.documents.length})</h2>
            {allData.documents.length === 0 ? (
              <p>No documents found</p>
            ) : (
              <div className={styles.dataGrid}>
                {allData.documents.map((d: any) => (
                  <div key={`${d.doc_type || 'permanent'}-${d.id}`} className={styles.dataCard}>
                    <h3>{d.entity_name || 'Unknown Entity'}</h3>
                    <p>Secretary: {d.secretary_name || d.uploaded_by_email || 'N/A'}</p>
                    <p>Type: {d.document_type} ({d.doc_type || 'permanent'})</p>
                    <p>File: {d.file_name}</p>
                    <p>Uploaded: {d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}