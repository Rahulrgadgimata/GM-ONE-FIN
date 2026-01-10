import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../../components/Header'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../utils/api'
import styles from '../../../styles/UploadDocuments.module.css'

export default function UploadDocuments() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated } = useAuth()
  const [entity, setEntity] = useState<any>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [selectedDocType, setSelectedDocType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const documentTypes = [
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'gst_certificate', label: 'GST Certificate' },
    { value: 'incorporation_cert', label: 'Incorporation Certificate' },
    { value: 'moa_aoa', label: 'MOA / AOA' }
  ]

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'company_secretary') {
      router.push('/dashboard')
      return
    }
    if (id) {
      fetchEntity()
      fetchDocuments()
    }
  }, [id, isAuthenticated])

  const fetchEntity = async () => {
    try {
      const res = await api.get(`/entities/${id}`)
      setEntity(res.data)
    } catch (error) {
      console.error('Failed to fetch entity:', error)
      router.push('/entities')
    }
  }

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/documents/permanent/${id}`)
      const data = res.data as { documents: any[] }
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedDocType || !file) {
      setError('Please select document type and file')
      return
    }

    setLoading(true)

    try {
      const uploadData = new FormData()
      uploadData.append('entity_id', id as string)
      uploadData.append('document_type', selectedDocType)
      uploadData.append('file', file)

      await api.post('/documents/permanent/upload', uploadData)

      setSuccess('Document uploaded successfully!')
      setSelectedDocType('')
      setFile(null)
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      fetchDocuments()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload document')
    } finally {
      setLoading(false)
    }
  }

  if (!entity) {
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
        <title>Upload Documents - {entity.company_name}</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Upload Permanent Documents</h1>
          <p className={styles.subtitle}>
            Entity: <strong>{entity.company_name}</strong> ({entity.status})
          </p>

          {error && <div className={styles.errorMessage}>{error}</div>}
          {success && <div className={styles.successMessage}>{success}</div>}

          <div className={styles.content}>
            <div className={styles.uploadSection}>
              <h2>Upload New Document</h2>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="document_type" className={styles.label}>
                    Document Type <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="document_type"
                    className={styles.select}
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Document Type</option>
                    {documentTypes.map(doc => (
                      <option key={doc.value} value={doc.value}>
                        {doc.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="file" className={styles.label}>
                    File <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="file"
                    id="file"
                    className={styles.fileInput}
                    onChange={handleFileChange}
                    required
                    disabled={loading}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  {file && (
                    <p className={styles.fileInfo}>Selected: {file.name}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>
            </div>

            <div className={styles.documentsSection}>
              <h2>Uploaded Documents</h2>
              {documents.length === 0 ? (
                <p className={styles.noDocs}>No documents uploaded yet</p>
              ) : (
                <div className={styles.documentsList}>
                  {documents.map(doc => (
                    <div key={doc.id} className={styles.documentCard}>
                      <div className={styles.documentInfo}>
                        <strong>{doc.document_type.replace('_', ' ').toUpperCase()}</strong>
                        <p>{doc.file_name}</p>
                        <small>Uploaded: {new Date(doc.uploaded_at).toLocaleString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {entity.status === 'pending_approval' && documents.length >= 4 && (
                <div className={styles.note}>
                  <p>✓ All required documents uploaded. Waiting for admin approval.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

