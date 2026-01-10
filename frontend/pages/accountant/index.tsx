import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/AccountantDashboard.module.css'

export default function AccountantDashboard() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [entities, setEntities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('monthly')
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && user.role !== 'accountant') {
      router.push('/dashboard')
      return
    }

    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, authLoading, user])

  const fetchData = async () => {
    try {
      const [entitiesRes, notificationsRes] = await Promise.all([
        api.get('/entities/my-entities'),
        api.get('/notifications?unread_only=true')
      ])
      
      const entitiesData = entitiesRes.data as { entities: any[] }
      const notificationsData = notificationsRes.data as { notifications: any[] }
      
      setEntities(entitiesData.entities || [])
      setNotifications(notificationsData.notifications || [])
      
      // Set current financial year
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1
      
      let fy = ''
      if (currentMonth >= 4) {
        fy = `${currentYear}-${currentYear + 1}`
      } else {
        fy = `${currentYear - 1}-${currentYear}`
      }
      setSelectedYear(fy)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    if (!selectedEntity) {
      alert('Please select an entity first')
      return
    }
    router.push(`/accountant/upload?entity_id=${selectedEntity}&year=${selectedYear}&period=${selectedPeriod}`)
  }

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>Loading...</div>
      </>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Generate financial years (last 3 years)
  const currentYear = new Date().getFullYear()
  const financialYears = []
  for (let i = 0; i < 3; i++) {
    const year = currentYear - i
    financialYears.push(`${year - 1}-${year}`)
    if (i === 0) {
      const month = new Date().getMonth() + 1
      if (month >= 4) {
        financialYears.unshift(`${year}-${year + 1}`)
      }
    }
  }

  return (
    <>
      <Head>
        <title>Accountant Dashboard - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Accountant Dashboard</h1>
              <p className={styles.welcome}>
                Welcome, {user?.email}
              </p>
            </div>
            {notifications.length > 0 && (
              <div className={styles.notificationBadge}>
                {notifications.length} new notification{notifications.length > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Assigned Entities */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Assigned Entities</h2>
            {entities.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No entities assigned to you yet.</p>
                <p className={styles.emptySubtext}>Contact your Company Secretary to get assigned to entities.</p>
              </div>
            ) : (
              <div className={styles.entitiesGrid}>
                {entities.map(entity => (
                  <div 
                    key={entity.id} 
                    className={`${styles.entityCard} ${selectedEntity === entity.id ? styles.selected : ''}`}
                    onClick={() => setSelectedEntity(entity.id)}
                  >
                    <h3>{entity.company_name}</h3>
                    <div className={styles.entityDetails}>
                      <div><strong>PAN:</strong> {entity.pan}</div>
                      <div><strong>GSTIN:</strong> {entity.gstin}</div>
                      <div><strong>Type:</strong> {entity.company_type}</div>
                    </div>
                    <div className={styles.statusBadge}>
                      {entity.status.replace('_', ' ').toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Upload Section */}
          {entities.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Upload Documents</h2>
              <div className={styles.uploadForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Select Entity</label>
                    <select
                      value={selectedEntity || ''}
                      onChange={(e) => setSelectedEntity(Number(e.target.value))}
                      required
                    >
                      <option value="">-- Select Entity --</option>
                      {entities.map(entity => (
                        <option key={entity.id} value={entity.id}>
                          {entity.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Financial Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      required
                    >
                      {financialYears.map(fy => (
                        <option key={fy} value={fy}>{fy}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Period Type</label>
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      required
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleUploadClick}
                  disabled={!selectedEntity || !selectedYear}
                  className={styles.uploadBtn}
                >
                  Upload Documents →
                </button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Recent Notifications</h2>
              <div className={styles.notificationsList}>
                {notifications.slice(0, 5).map(notif => (
                  <div key={notif.id} className={styles.notificationItem}>
                    <div className={styles.notificationHeader}>
                      <strong>{notif.title}</strong>
                      <span className={styles.notificationTime}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{notif.message}</p>
                  </div>
                ))}
                <Link href="/notifications" className={styles.viewAllLink}>
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Assigned Entities</h3>
              <p className={styles.statNumber}>{entities.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Unread Notifications</h3>
              <p className={styles.statNumber}>{notifications.length}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
