import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/EntitiesList.module.css'

export default function EntitiesList() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAccountantModal, setShowAccountantModal] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null)
  const [accountantForm, setAccountantForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    access_type: 'all'
  })
  const [accountantError, setAccountantError] = useState('')
  const [accountantLoading, setAccountantLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchEntities()
  }, [isAuthenticated])

  const fetchEntities = async () => {
    try {
      const res = await api.get('/entities/my-entities')
      console.log('Entities API response:', res.data)
      alert('Entities API response: ' + JSON.stringify(res.data))
      const data = res.data as { entities: any[] }
      setEntities(data.entities || [])
    } catch (error) {
      console.error('Failed to fetch entities:', error)
      alert('Failed to fetch entities: ' + JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive
      case 'pending_approval':
        return styles.statusPending
      case 'rejected':
        return styles.statusRejected
      default:
        return ''
    }
  }

  const openAccountantModal = (entityId: number) => {
    setSelectedEntity(entityId)
    setShowAccountantModal(true)
    setAccountantForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      access_type: 'all'
    })
    setAccountantError('')
  }

  const closeAccountantModal = () => {
    setShowAccountantModal(false)
    setSelectedEntity(null)
    setAccountantError('')
  }

  const handleAccountantSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccountantError('')

    if (!accountantForm.name || !accountantForm.email || !accountantForm.password) {
      setAccountantError('All fields are required')
      return
    }

    if (accountantForm.password !== accountantForm.confirmPassword) {
      setAccountantError('Passwords do not match')
      return
    }

    if (accountantForm.password.length < 8) {
      setAccountantError('Password must be at least 8 characters')
      return
    }

    if (!selectedEntity) {
      setAccountantError('No entity selected')
      return
    }

    setAccountantLoading(true)
    try {
      const response = await api.post('/users/create-accountant', {
        name: accountantForm.name,
        email: accountantForm.email,
        password: accountantForm.password,
        entity_id: selectedEntity,
        access_type: accountantForm.access_type
      })

      if (response.error) {
        setAccountantError(response.error)
      } else {
        alert('Accountant created successfully!')
        closeAccountantModal()
        fetchEntities() // Refresh entities list
      }
    } catch (error: any) {
      setAccountantError(error.response?.data?.error || 'Failed to create accountant')
    } finally {
      setAccountantLoading(false)
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
        <title>My Entities - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>My Entities</h1>
            {user?.role === 'company_secretary' && (
              <Link href="/entities/create" className={styles.createBtn}>
                + Create New Entity
              </Link>
            )}
          </div>

          {entities.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No entities found</p>
              {user?.role === 'company_secretary' && (
                <Link href="/entities/create" className={styles.createBtn}>
                  Create Your First Entity
                </Link>
              )}
            </div>
          ) : (
            <div className={styles.entitiesGrid}>
              {entities.map(entity => (
                <div key={entity.id} className={styles.entityCard}>
                  <div className={styles.entityHeader}>
                    <h2>{entity.company_name}</h2>
                    <span className={`${styles.status} ${getStatusColor(entity.status)}`}>
                      {entity.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.entityDetails}>
                    <div className={styles.detailRow}>
                      <strong>PAN:</strong> {entity.pan}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>GSTIN:</strong> {entity.gstin}
                    </div>
                    <div className={styles.detailRow}>
                      <strong>Type:</strong> {entity.company_type}
                    </div>
                  </div>
                  <div className={styles.actions}>
                    {entity.status === 'pending_approval' && user?.role === 'company_secretary' && (
                      <Link
                        href={`/entities/${entity.id}/upload-documents`}
                        className={styles.actionBtn}
                      >
                        Upload Documents
                      </Link>
                    )}
                    {entity.status === 'active' && (
                      <>
                        <Link
                          href={`/vault?entity_id=${entity.id}`}
                          className={styles.actionBtn}
                        >
                          View Documents
                        </Link>
                        {user?.role === 'company_secretary' && (
                          <>
                            <Link
                              href={`/entities/${entity.id}/upload-documents`}
                              className={styles.actionBtn}
                            >
                              + Add Documents
                            </Link>
                            <button
                              onClick={() => openAccountantModal(entity.id)}
                              className={styles.actionBtn}
                            >
                              + Add Accountant
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Accountant Modal */}
      {showAccountantModal && (
        <div className={styles.modalOverlay} onClick={closeAccountantModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Create Accountant Login</h2>
              <button className={styles.modalClose} onClick={closeAccountantModal}>×</button>
            </div>
            <form onSubmit={handleAccountantSubmit} className={styles.modalForm}>
              {accountantError && (
                <div className={styles.errorMessage}>{accountantError}</div>
              )}
              
              <div className={styles.formGroup}>
                <label>Accountant Name</label>
                <input
                  type="text"
                  value={accountantForm.name}
                  onChange={(e) => setAccountantForm({...accountantForm, name: e.target.value})}
                  required
                  placeholder="Enter accountant name"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Email (Login ID)</label>
                <input
                  type="email"
                  value={accountantForm.email}
                  onChange={(e) => setAccountantForm({...accountantForm, email: e.target.value})}
                  required
                  placeholder="accountant@example.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Password</label>
                <input
                  type="password"
                  value={accountantForm.password}
                  onChange={(e) => setAccountantForm({...accountantForm, password: e.target.value})}
                  required
                  placeholder="Minimum 8 characters"
                  minLength={8}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={accountantForm.confirmPassword}
                  onChange={(e) => setAccountantForm({...accountantForm, confirmPassword: e.target.value})}
                  required
                  placeholder="Re-enter password"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Access Type</label>
                <select
                  value={accountantForm.access_type}
                  onChange={(e) => setAccountantForm({...accountantForm, access_type: e.target.value})}
                  required
                >
                  <option value="all">All (Monthly, Quarterly, Yearly)</option>
                  <option value="monthly">Monthly Only</option>
                  <option value="quarterly">Quarterly Only</option>
                  <option value="yearly">Yearly Only</option>
                </select>
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeAccountantModal} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={accountantLoading}>
                  {accountantLoading ? 'Creating...' : 'Create Accountant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}





