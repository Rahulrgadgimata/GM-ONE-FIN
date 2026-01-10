import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import styles from '../styles/Login.module.css'

export default function Login() {
  const router = useRouter()
  const { login, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      // Don't push to dashboard here - let the useEffect handle it
      // because auth context updates are asynchronous
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.loginWrapper}>
            <div className={styles.loginCard}>
              <h1 className={styles.title}>Login to GM Finance Portal</h1>
              <p className={styles.subtitle}>Enter your credentials to continue</p>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    className={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.captchaNote}>
                  <p>🔒 Secure login with government-grade encryption</p>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                <div className={styles.links}>
                  <Link href="/" className={styles.link}>Back to Home</Link>
                  <span>|</span>
                  <Link href="/signup" className={styles.link}>Don&apos;t have an account? Sign Up</Link>
                </div>
              </form>
            </div>

            <div className={styles.infoBox}>
              <h3>About Login</h3>
              <div className={styles.infoSection}>
                <h4>Company Secretary</h4>
                <p>Login with your registered email and password to manage your entities and documents.</p>
              </div>
              <div className={styles.infoSection}>
                <h4>Accountant / Staff</h4>
                <p>Access assigned entities and upload periodic documents for audit compliance.</p>
              </div>
              <div className={styles.infoSection}>
                <h4>Super Admin</h4>
                <p>Manage users, approve entities, and oversee system operations.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

