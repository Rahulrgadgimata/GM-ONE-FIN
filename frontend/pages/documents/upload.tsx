import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/DocumentUpload.module.css'

export default function UploadDocument() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [entities, setEntities] = useState<any[]>([])
  const [formData, setFormData] = useState({
    entity_id: '',
    financial_year: '',
    period: 'monthly',
    period_value: '',
    document_type: '',
    file: null as File | null
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'accountant') {
      router.push('/dashboard')
      return
    }
    fetchEntities()
  }, [isAuthenticated])

  const fetchEntities = async () => {
    try {
      const res = await api.get('/entities/my-entities')
      const data = res.data as { entities: any[] }
      setEntities(data.entities || [])
    } catch (error) {
      console.error('Failed to fetch entities:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.file) {
      setError('Please select a file')
      return
    }

    setLoading(true)

    try {
      const uploadData = new FormData()
      uploadData.append('entity_id', formData.entity_id)
      uploadData.append('financial_year', formData.financial_year)
      uploadData.append('period', formData.period)
      uploadData.append('period_value', formData.period_value)
      uploadData.append('document_type', formData.document_type)
      uploadData.append('file', formData.file)

      await api.post('/documents/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setSuccess('Document uploaded successfully!')
      setFormData({
        entity_id: '',
        financial_year: '',
        period: 'monthly',
        period_value: '',
        document_type: '',
        file: null
      })
      
      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  const getPeriodOptions = () => {
    if (formData.period === 'monthly') {
      return ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    } else if (formData.period === 'quarterly') {
      return ['Q1', 'Q2', 'Q3', 'Q4']
    } else {
      return [`FY${formData.financial_year}`]
    }
  }

  return (
    <>
      <Head>
        <title>Upload Document - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Upload Periodic Document</h1>
          <p className={styles.subtitle}>
            Upload periodic documents for assigned entities. Documents are versioned automatically.
          </p>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="entity_id" className={styles.label}>
                Entity <span className={styles.required}>*</span>
              </label>
              <select
                id="entity_id"
                name="entity_id"
                className={styles.select}
                value={formData.entity_id}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select Entity</option>
                {entities.map(entity => (
                  <option key={entity.id} value={entity.id}>
                    {entity.company_name} ({entity.status})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="financial_year" className={styles.label}>
                  Financial Year <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="financial_year"
                  name="financial_year"
                  className={styles.input}
                  placeholder="2023-24"
                  value={formData.financial_year}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="period" className={styles.label}>
                  Period Type <span className={styles.required}>*</span>
                </label>
                <select
                  id="period"
                  name="period"
                  className={styles.select}
                  value={formData.period}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="period_value" className={styles.label}>
                Period Value <span className={styles.required}>*</span>
              </label>
              <select
                id="period_value"
                name="period_value"
                className={styles.select}
                value={formData.period_value}
                onChange={handleChange}
                required
                disabled={loading || !formData.financial_year}
              >
                <option value="">Select {formData.period}</option>
                {getPeriodOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="document_type" className={styles.label}>
                Document Type <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="document_type"
                name="document_type"
                className={styles.input}
                placeholder="e.g., Balance Sheet, P&L Statement, Tax Return"
                value={formData.document_type}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="file" className={styles.label}>
                File <span className={styles.required}>*</span>
              </label>
              <input
                type="file"
                id="file"
                name="file"
                className={styles.fileInput}
                onChange={handleFileChange}
                required
                disabled={loading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              />
              {formData.file && (
                <p className={styles.fileInfo}>Selected: {formData.file.name}</p>
              )}
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

