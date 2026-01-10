import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import styles from '../styles/Notifications.module.css'

export default function Notifications() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchNotifications()
  }, [isAuthenticated, filter])

  const fetchNotifications = async () => {
    try {
      const queryParams = filter === 'unread' ? '?unread_only=true' : ''
      const res = await api.get(`/notifications${queryParams}`)
      const data = res.data as { notifications: any[] }
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await api.post(`/api/notifications/${id}/read`)
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read')
      fetchNotifications()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
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
        <title>Notifications - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Notifications</h1>
            <div className={styles.actions}>
              <select
                className={styles.filterSelect}
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
              </select>
              <button className={styles.markAllBtn} onClick={markAllAsRead}>
                Mark All as Read
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No notifications found</p>
            </div>
          ) : (
            <div className={styles.notificationsList}>
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`${styles.notificationItem} ${!notif.is_read ? styles.unread : ''}`}
                >
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h3 className={styles.notificationTitle}>{notif.title}</h3>
                      {!notif.is_read && (
                        <button
                          className={styles.markReadBtn}
                          onClick={() => markAsRead(notif.id)}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    <p className={styles.notificationMessage}>{notif.message}</p>
                    <div className={styles.notificationMeta}>
                      <span className={styles.notificationType}>{notif.type}</span>
                      <span className={styles.notificationDate}>
                        {new Date(notif.created_at).toLocaleString()}
                      </span>
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

