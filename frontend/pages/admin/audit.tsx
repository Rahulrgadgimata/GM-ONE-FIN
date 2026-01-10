import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/AdminAudit.module.css'

export default function AdminAudit() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    days: '30'
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
    fetchLogs()
  }, [isAuthenticated, user, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.action) queryParams.append('action', filters.action)
      if (filters.resource_type) queryParams.append('resource_type', filters.resource_type)
      queryParams.append('days', filters.days)
      
      const queryString = queryParams.toString()
      const res = await api.get(`/audit/logs${queryString ? `?${queryString}` : ''}`)
      const data = res.data as { logs: any[] }
      setLogs(data.logs || [])
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('approve')) return styles.actionSuccess
    if (action.includes('reject') || action.includes('delete')) return styles.actionDanger
    if (action.includes('login')) return styles.actionInfo
    if (action.includes('upload')) return styles.actionWarning
    return ''
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loading}>Loading audit logs...</div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Audit Logs - Admin - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Audit Logs</h1>
              <p className={styles.subtitle}>System activity and audit trails</p>
            </div>
            <button onClick={fetchLogs} className={styles.refreshBtn}>
              🔄 Refresh
            </button>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="create">Create</option>
                <option value="upload">Upload</option>
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="assign">Assign</option>
                <option value="create_accountant">Create Accountant</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Resource Type</label>
              <select
                value={filters.resource_type}
                onChange={(e) => handleFilterChange('resource_type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="entity">Entity</option>
                <option value="document">Document</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Time Period</label>
              <select
                value={filters.days}
                onChange={(e) => handleFilterChange('days', e.target.value)}
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>Total Logs</h3>
              <p className={styles.statNumber}>{logs.length}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Logins</h3>
              <p className={styles.statNumber}>
                {logs.filter(l => l.action === 'login').length}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3>Uploads</h3>
              <p className={styles.statNumber}>
                {logs.filter(l => l.action.includes('upload')).length}
              </p>
            </div>
            <div className={styles.statCard}>
              <h3>Approvals</h3>
              <p className={styles.statNumber}>
                {logs.filter(l => l.action === 'approve').length}
              </p>
            </div>
          </div>

          {logs.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No audit logs found for the selected filters</p>
            </div>
          ) : (
            <div className={styles.logsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <tr key={log.id}>
                      <td className={styles.timestamp}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className={styles.user}>
                        {log.user?.email || 'Unknown'}
                      </td>
                      <td>
                        <span className={`${styles.actionBadge} ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td>
                        {log.resource_type && (
                          <span className={styles.resource}>
                            {log.resource_type} #{log.resource_id || 'N/A'}
                          </span>
                        )}
                      </td>
                      <td className={styles.details}>
                        {log.details || '-'}
                      </td>
                      <td className={styles.ip}>
                        {log.ip_address || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
