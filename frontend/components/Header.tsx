import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import styles from './Header.module.css'

export default function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <span className={styles.logoText}>Finance Build</span>
          </Link>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLeft}>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className={`${styles.navLink} ${router.pathname === '/dashboard' ? styles.active : ''}`}>
                  Dashboard
                </Link>
                {user?.role === 'company_secretary' && (
                  <Link href="/entities" className={`${styles.navLink} ${router.pathname.includes('/entities') ? styles.active : ''}`}>
                    Entities
                  </Link>
                )}
                {user?.role === 'accountant' && (
                  <Link href="/accountant" className={`${styles.navLink} ${router.pathname.includes('/accountant') ? styles.active : ''}`}>
                    Accountant
                  </Link>
                )}
                {user?.role === 'super_admin' && (
                  <Link href="/admin" className={`${styles.navLink} ${router.pathname === '/admin' ? styles.active : ''}`}>
                    Admin
                  </Link>
                )}
                <Link href="/vault" className={`${styles.navLink} ${router.pathname === '/vault' ? styles.active : ''}`}>
                  Vault
                </Link>
              </>
            )}
          </div>

          <div className={styles.navRight}>
            {isAuthenticated ? (
              <>
                <div className={styles.userInfo}>
                  <span className={styles.userAvatar}>{user?.email?.charAt(0).toUpperCase()}</span>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{user?.email}</span>
                    <span className={styles.userRole}>{user?.role?.replace('_', ' ')}</span>
                  </div>
                </div>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.navLink}>Login</Link>
                <Link href="/signup" className={styles.signupBtn}>Sign Up</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}