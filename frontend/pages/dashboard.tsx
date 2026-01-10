import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import styles from '../styles/Dashboard.module.css'

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      // Redirect role-specific dashboards
      if (user?.role === 'accountant') {
        router.push('/accountant')
        return
      }
      
      fetchDashboardData()
    }
  }, [isAuthenticated, authLoading, user])

  const fetchDashboardData = async () => {
    try {
      if (user?.role === 'super_admin') {
        const [entitiesRes, usersRes] = await Promise.all([
          api.get('/entities/pending'),
          api.get('/users')
        ])
        const entitiesData = entitiesRes.data as { entities: any[] }
        const usersData = usersRes.data as { users?: any[] }
        setStats({
          pendingEntities: entitiesData.entities?.length || 0,
          totalUsers: usersData?.users?.length || (Array.isArray(usersData) ? usersData.length : 0)
        })
      } else if (user?.role === 'company_secretary') {
        const res = await api.get('/entities/my-entities')
        const data = res.data as { entities: any[] }
        const entities = data.entities || []
        setStats({
          totalEntities: entities.length,
          pendingEntities: entities.filter((e: any) => e.status === 'pending_approval').length,
          activeEntities: entities.filter((e: any) => e.status === 'active').length
        })
      } else if (user?.role === 'accountant') {
        const res = await api.get('/entities/my-entities')
        const data = res.data as { entities: any[] }
        setStats({
          assignedEntities: data.entities?.length || 0
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <>
      <Head>
        <title>Dashboard - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.welcome}>
            Welcome, {user?.email} ({user?.role?.replace('_', ' ').toUpperCase()})
          </p>

          <div className={styles.statsGrid}>
            {user?.role === 'super_admin' && (
              <>
                <div className={styles.statCard}>
                  <h3>Pending Approvals</h3>
                  <p className={styles.statNumber}>{stats.pendingEntities || 0}</p>
                  <Link href="/admin/approvals" className={styles.statLink}>
                    Review Entities →
                  </Link>
                </div>
                <div className={styles.statCard}>
                  <h3>Total Users</h3>
                  <p className={styles.statNumber}>{stats.totalUsers || 0}</p>
                  <Link href="/admin/users" className={styles.statLink}>
                    Manage Users →
                  </Link>
                </div>
              </>
            )}

            {user?.role === 'company_secretary' && (
              <>
                <div className={styles.statCard}>
                  <h3>Total Entities</h3>
                  <p className={styles.statNumber}>{stats.totalEntities || 0}</p>
                  <Link href="/entities" className={styles.statLink}>
                    View Entities →
                  </Link>
                </div>
                <div className={styles.statCard}>
                  <h3>Pending Approval</h3>
                  <p className={styles.statNumber}>{stats.pendingEntities || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <h3>Active Entities</h3>
                  <p className={styles.statNumber}>{stats.activeEntities || 0}</p>
                </div>
              </>
            )}

            {user?.role === 'accountant' && (
              <div className={styles.statCard}>
                <h3>Assigned Entities</h3>
                <p className={styles.statNumber}>{stats.assignedEntities || 0}</p>
                <Link href="/documents" className={styles.statLink}>
                  Upload Documents →
                </Link>
              </div>
            )}
          </div>

          <div className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionsGrid}>
              {user?.role === 'super_admin' && (
                <>
                  <Link href="/admin/approvals" className={styles.actionCard}>
                    <h3>Review Pending Entities</h3>
                    <p>Approve or reject entity submissions</p>
                  </Link>
                  <Link href="/admin/users" className={styles.actionCard}>
                    <h3>User Management</h3>
                    <p>Create and manage users</p>
                  </Link>
                  <Link href="/admin/audit" className={styles.actionCard}>
                    <h3>Audit Logs</h3>
                    <p>View system activity logs</p>
                  </Link>
                </>
              )}

              {user?.role === 'company_secretary' && (
                <>
                  <Link href="/entities/create" className={styles.actionCard}>
                    <h3>Create New Entity</h3>
                    <p>Register a new company entity</p>
                  </Link>
                  <Link href="/entities" className={styles.actionCard}>
                    <h3>My Entities</h3>
                    <p>View and manage your entities</p>
                  </Link>
                  <Link href="/vault" className={styles.actionCard}>
                    <h3>Document Vault</h3>
                    <p>Access all documents</p>
                  </Link>
                </>
              )}

              {user?.role === 'accountant' && (
                <>
                  <Link href="/documents/upload" className={styles.actionCard}>
                    <h3>Upload Documents</h3>
                    <p>Upload periodic documents</p>
                  </Link>
                  <Link href="/vault" className={styles.actionCard}>
                    <h3>Document Vault</h3>
                    <p>View and download documents</p>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

