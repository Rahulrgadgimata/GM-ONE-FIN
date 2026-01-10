import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import styles from '../styles/Signup.module.css'

export default function Signup() {
  const router = useRouter()
  const { signup, isAuthenticated } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    pan: '',
    gstin: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/entities/create')
    }
  }, [isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pan' || name === 'gstin' ? value.toUpperCase() : value
    }))
  }

  const validatePAN = (pan: string) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)
  }

  const validateGSTIN = (gstin: string) => {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!validatePAN(formData.pan)) {
      setError('Invalid PAN format. Format: ABCDE1234F')
      return
    }

    if (!validateGSTIN(formData.gstin)) {
      setError('Invalid GSTIN format')
      return
    }

    setLoading(true)

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        pan: formData.pan,
        gstin: formData.gstin
      })
      // Don't push to entities/create here - let the useEffect handle it
      // because auth context updates are asynchronous
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.signupCard}>
            <h1 className={styles.title}>Sign Up - Company Secretary</h1>
            <p className={styles.subtitle}>
              Register as a Company Secretary to create and manage entities
            </p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={styles.input}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pan" className={styles.label}>
                  PAN <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="pan"
                  name="pan"
                  className={styles.input}
                  placeholder="ABCDE1234F"
                  value={formData.pan}
                  onChange={handleChange}
                  maxLength={10}
                  required
                  disabled={loading}
                />
                <small className={styles.helpText}>Format: ABCDE1234F</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="gstin" className={styles.label}>
                  GSTIN <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="gstin"
                  name="gstin"
                  className={styles.input}
                  placeholder="22AAAAA0000A1Z5"
                  value={formData.gstin}
                  onChange={handleChange}
                  maxLength={15}
                  required
                  disabled={loading}
                />
                <small className={styles.helpText}>15-character GSTIN</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>
                  Password <span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={styles.input}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword" className={styles.label}>
                  Confirm Password <span className={styles.required}>*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={styles.input}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.note}>
                <p>🔒 After signup, you will be redirected to create your first entity.</p>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className={styles.links}>
                <Link href="/login" className={styles.link}>
                  Already have an account? Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}

