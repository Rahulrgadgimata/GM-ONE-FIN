import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/AdminDashboard.module.css'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [entities, setEntities] = useState<any[]>([])
  const [accountants, setAccountants] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
    fetchData()
  }, [isAuthenticated, user, router])

  const fetchData = async () => {
    try {
      // Fetch all entities
      const entitiesRes = await api.get('/entities/my-entities')
      setEntities(entitiesRes.data.entities || [])

      // Fetch all users and filter accountants
      const usersRes = await api.get('/users/')
      const allUsers = usersRes.data.users || []
      const accs = allUsers.filter((u: any) => u.role === 'accountant')
      setAccountants(accs)

      // Fetch all documents
      const periodicRes = await api.get('/documents/vault')
      const permanentRes = await api.get('/documents/permanent/all')
      const periodicDocs = periodicRes.data.vault || []
      const permanentDocs = permanentRes.data.documents || []
      setDocuments([...periodicDocs, ...permanentDocs])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== 'super_admin') {
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
        <title>Admin Panel - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Admin Panel</h1>
          <p className={styles.subtitle}>Manage users, entities, and system settings</p>

          <div className={styles.adminGrid}>
            <Link href="/admin/approvals" className={styles.adminCard}>
              <h2>Pending Approvals</h2>
              <p>Review and approve pending entity submissions</p>
            </Link>

            <Link href="/admin/users" className={styles.adminCard}>
              <h2>User Management</h2>
              <p>Create, manage, and assign users to entities</p>
            </Link>

            <Link href="/admin/audit" className={styles.adminCard}>
              <h2>Audit Logs</h2>
              <p>View system activity and audit trails</p>
            </Link>
          </div>

          {loading ? (
            <div className={styles.loading}>Loading data...</div>
          ) : (
            <>
              <div className={styles.section}>
                <h2>All Entities</h2>
                {entities.length === 0 ? (
                  <p>No entities found</p>
                ) : (
                  <div className={styles.dataGrid}>
                    {entities.map(entity => (
                      <div key={entity.id} className={styles.dataCard}>
                        <h3>{entity.company_name}</h3>
                        <p>PAN: {entity.pan}</p>
                        <p>GSTIN: {entity.gstin}</p>
                        <p>Status: {entity.status}</p>
                        <p>Type: {entity.company_type}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <h2>All Accountants</h2>
                {accountants.length === 0 ? (
                  <p>No accountants found</p>
                ) : (
                  <div className={styles.dataGrid}>
                    {accountants.map(accountant => (
                      <div key={accountant.id} className={styles.dataCard}>
                        <h3>{accountant.email}</h3>
                        <p>PAN: {accountant.pan || 'N/A'}</p>
                        <p>GSTIN: {accountant.gstin || 'N/A'}</p>
                        <p>Active: {accountant.is_active ? 'Yes' : 'No'}</p>
                        <p>Created: {accountant.created_at ? new Date(accountant.created_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.section}>
                <h2>All Documents</h2>
                {documents.length === 0 ? (
                  <p>No documents found</p>
                ) : (
                  <div className={styles.documentsGrid}>
                    {documents.map(doc => (
                      <div key={`${doc.doc_type || 'permanent'}-${doc.id}`} className={styles.documentCard}>
                        <h4>{doc.entity_name || 'Unknown Entity'}</h4>
                        <p>Secretary: {doc.secretary_name || doc.uploaded_by_email || 'N/A'}</p>
                        <p>Type: {doc.document_type} ({doc.doc_type || 'permanent'})</p>
                        <p>File: {doc.file_name}</p>
                        <p>Uploaded: {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}






