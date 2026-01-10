import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/AccountantUpload.module.css'

export default function AccountantUpload() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    entity_id: '',
    financial_year: '',
    period: 'monthly',
    period_value: '',
    document_type: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [entities, setEntities] = useState<any[]>([])

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'accountant') {
      router.push('/accountant')
      return
    }

    // Get params from URL
    const { entity_id, year, period } = router.query
    if (entity_id) setFormData(prev => ({ ...prev, entity_id: String(entity_id) }))
    if (year) setFormData(prev => ({ ...prev, financial_year: String(year) }))
    if (period) setFormData(prev => ({ ...prev, period: String(period) }))

    fetchEntities()
  }, [isAuthenticated, router])

  const fetchEntities = async () => {
    try {
      const res = await api.get('/entities/my-entities')
      const data = res.data as { entities: any[] }
      setEntities(data.entities || [])
    } catch (error) {
      console.error('Failed to fetch entities:', error)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError('')
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedFile) {
      setError('Please select a file')
      return
    }

    if (!formData.entity_id || !formData.financial_year || !formData.period_value || !formData.document_type) {
      setError('Please fill all required fields')
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
      uploadData.append('file', selectedFile)

      const response = await api.post('/documents/upload', uploadData)

      if (response.error) {
        setError(response.error)
      } else {
        setSuccess('Document uploaded successfully!')
        setSelectedFile(null)
        setFormData({
          entity_id: formData.entity_id, // Keep entity selected
          financial_year: formData.financial_year, // Keep year selected
          period: formData.period,
          period_value: '',
          document_type: ''
        })
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Upload Document - Accountant - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Upload Document</h1>
            <button onClick={() => router.push('/accountant')} className={styles.backBtn}>
              ← Back to Dashboard
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Entity & Period Information</h2>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Entity <span className={styles.required}>*</span></label>
                  <select
                    name="entity_id"
                    value={formData.entity_id}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Entity</option>
                    {entities.map(entity => (
                      <option key={entity.id} value={entity.id}>
                        {entity.company_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Financial Year <span className={styles.required}>*</span></label>
                  <input
                    type="text"
                    name="financial_year"
                    value={formData.financial_year}
                    onChange={handleChange}
                    placeholder="2023-24"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Period Type <span className={styles.required}>*</span></label>
                  <select
                    name="period"
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

                <div className={styles.formGroup}>
                  <label>Period Value <span className={styles.required}>*</span></label>
                  <select
                    name="period_value"
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
              </div>

              <div className={styles.formGroup}>
                <label>Document Type <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  name="document_type"
                  value={formData.document_type}
                  onChange={handleChange}
                  placeholder="e.g., Balance Sheet, P&L Statement, Tax Return"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formSection}>
              <h2 className={styles.sectionTitle}>File Upload</h2>
              
              <div
                ref={dropZoneRef}
                className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${selectedFile ? styles.hasFile : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileInputChange}
                  className={styles.fileInput}
                  disabled={loading}
                />
                
                {selectedFile ? (
                  <div className={styles.filePreview}>
                    <div className={styles.fileIcon}>📄</div>
                    <div className={styles.fileInfo}>
                      <div className={styles.fileName}>{selectedFile.name}</div>
                      <div className={styles.fileSize}>{formatFileSize(selectedFile.size)}</div>
                    </div>
                    <button
                      type="button"
                      className={styles.removeFile}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedFile(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className={styles.dropZoneContent}>
                    <div className={styles.dropZoneIcon}>📤</div>
                    <p className={styles.dropZoneText}>
                      <strong>Drag & drop your file here</strong>
                    </p>
                    <p className={styles.dropZoneSubtext}>or click to browse</p>
                    <p className={styles.dropZoneHint}>Supports: PDF, Images, Excel, Word, etc.</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !selectedFile}
              >
                {loading ? 'Uploading...' : 'Upload Document'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => router.push('/accountant')}
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
