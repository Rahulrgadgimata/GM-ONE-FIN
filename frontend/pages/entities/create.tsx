import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../utils/api'
import styles from '../../styles/EntityCreate.module.css'

interface FormData {
  company_name: string
  pan: string
  gstin: string
  company_type: string
  address: string
  contact: string
  cin: string
  incorporation_date: string
  fy_start: string
  fy_end: string
  owner: string
}

interface DocumentFile {
  file: File
  category: string
}

export default function CreateEntity() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState<FormData>({
    company_name: '',
    pan: '',
    gstin: '',
    company_type: '',
    address: '',
    contact: '',
    cin: '',
    incorporation_date: '',
    fy_start: '',
    fy_end: '',
    owner: ''
  })
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (user && user.role !== 'company_secretary') {
      router.push('/dashboard')
    }
  }, [isAuthenticated, authLoading, user, router])

  useEffect(() => {
    // Fetch document categories
    const fetchCategories = async () => {
      try {
        const response = await api.get('/entities/categories')
        const data = response.data as { categories?: any[] }
        if (data?.categories) {
          setCategories(data.categories)
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }
    fetchCategories()
  }, [])

  // Debug: Log documentFiles changes
  useEffect(() => {
    console.log('documentFiles state updated:', documentFiles.map(d => ({
      category: d.category,
      fileName: d.file?.name,
      fileSize: d.file?.size,
      fileType: d.file?.type
    })))
  }, [documentFiles])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'pan' || name === 'gstin' || name === 'cin' ? value.toUpperCase() : value
    }))
  }

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    const category = (e.target as any).dataset.category
    
    console.log('File selected:', files?.[0]?.name, 'Category:', category)
    
    if (files && files[0] && category) {
      const selectedFile = files[0]
      console.log('Adding file to state:', selectedFile.name, selectedFile.type, selectedFile.size)
      
      setDocumentFiles(prev => {
        // Remove existing file for this category if any
        const filtered = prev.filter(doc => doc.category !== category)
        // Add new file
        const updated = [...filtered, {
          file: selectedFile,
          category: category
        }]
        console.log('Updated documentFiles:', updated.map(d => ({ category: d.category, fileName: d.file.name })))
        return updated
      })
      
      // Reset input to allow same file to be selected again
      e.target.value = ''
    } else {
      console.log('File selection failed:', { files: !!files, fileCount: files?.length, category })
    }
  }

  const removeDocument = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index))
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

    // Validation
    if (!formData.company_name.trim()) {
      setError('Company name is required')
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

    if (!formData.company_type.trim()) {
      setError('Company type is required')
      return
    }

    if (!formData.address.trim()) {
      setError('Address is required')
      return
    }

    setLoading(true)

    try {
      // Create FormData for multipart upload
      const formDataObj = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key as keyof FormData]) {
          formDataObj.append(key, formData[key as keyof FormData])
        }
      })
      
      // Add document files
      console.log('Adding files to FormData:', documentFiles.length)
      documentFiles.forEach((doc, index) => {
        if (doc.file) {
          console.log(`Adding file ${index}:`, doc.file.name, 'Category:', doc.category)
          formDataObj.append('files[]', doc.file)
          formDataObj.append('categories[]', doc.category)
        }
      })

      console.log('Submitting form data...')
      console.log('Form data keys:', Array.from(formDataObj.keys()))
      console.log('Document files count:', documentFiles.length)
      
      const response = await api.post('/entities/create', formDataObj)
      
      console.log('Response received:', JSON.stringify(response, null, 2))

      if (response.error) {
        console.error('Error from server:', response.error)
        const errorMsg = typeof response.error === 'string' ? response.error : JSON.stringify(response.error)
        setError(errorMsg)
        setLoading(false)
        return
      }

      // Check if we have a successful response
      if (response.data) {
        // Check if it's the expected structure
        if ((response.data as any).message || (response.data as any).entity) {
          console.log('Entity created successfully:', response.data)
          // Show success message briefly before redirect
          setError('')
          // Redirect to entities list
          setTimeout(() => {
            router.push('/entities')
          }, 500)
        } else {
          console.error('Unexpected response structure:', response.data)
          setError('Server response format unexpected. Check console for details.')
          setLoading(false)
        }
      } else {
        console.error('No data in response:', response)
        setError('No data received from server. Please check console for details.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Exception during entity creation:', err)
      console.error('Error stack:', err.stack)
      setError(err.message || 'Failed to create entity. Please check console for details.')
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <Head>
        <title>Create Entity - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.formCard}>
            <h1 className={styles.title}>Create New Entity</h1>
            <p className={styles.subtitle}>
              Register your company for audit and document management
            </p>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Basic Information */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Basic Information</h2>
                
                <div className={styles.formGroup}>
                  <label htmlFor="company_name" className={styles.label}>
                    Company Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    className={styles.input}
                    placeholder="Enter company name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles.formRow}>
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
                      required
                      disabled={loading}
                      maxLength={10}
                    />
                    <small className={styles.hint}>Format: ABCDE1234F</small>
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
                      placeholder="29ABCDE1234F1Z5"
                      value={formData.gstin}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      maxLength={15}
                    />
                    <small className={styles.hint}>Format: 29ABCDE1234F1Z5</small>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="company_type" className={styles.label}>
                      Company Type <span className={styles.required}>*</span>
                    </label>
                    <select
                      id="company_type"
                      name="company_type"
                      className={styles.select}
                      value={formData.company_type}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select company type</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="LLP">LLP</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                      <option value="Trust">Trust</option>
                      <option value="NGO">NGO</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="owner" className={styles.label}>
                      Owner Name
                    </label>
                    <input
                      type="text"
                      id="owner"
                      name="owner"
                      className={styles.input}
                      placeholder="Enter owner name"
                      value={formData.owner}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="address" className={styles.label}>
                    Address <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    className={styles.textarea}
                    placeholder="Enter complete company address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="contact" className={styles.label}>
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      id="contact"
                      name="contact"
                      className={styles.input}
                      placeholder="Enter contact number"
                      value={formData.contact}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cin" className={styles.label}>
                      CIN (Corporate ID)
                    </label>
                    <input
                      type="text"
                      id="cin"
                      name="cin"
                      className={styles.input}
                      placeholder="Corporate Identification Number"
                      value={formData.cin}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={21}
                    />
                  </div>
                </div>
              </div>

              {/* Dates & Financial Information */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Dates & Financial Information</h2>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="incorporation_date" className={styles.label}>
                      Incorporation Date
                    </label>
                    <input
                      type="date"
                      id="incorporation_date"
                      name="incorporation_date"
                      className={styles.input}
                      value={formData.incorporation_date}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="fy_start" className={styles.label}>
                      Financial Year Start
                    </label>
                    <input
                      type="date"
                      id="fy_start"
                      name="fy_start"
                      className={styles.input}
                      value={formData.fy_start}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="fy_end" className={styles.label}>
                      Financial Year End
                    </label>
                    <input
                      type="date"
                      id="fy_end"
                      name="fy_end"
                      className={styles.input}
                      value={formData.fy_end}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Upload Documents (Optional)</h2>
                <p className={styles.sectionDescription}>
                  Upload documents related to your entity. All file types are accepted (PDF, Images, Documents, etc.)
                </p>

                <div className={styles.categoryGrid}>
                  {categories.map((category) => {
                    const uploadedFile = documentFiles.find(doc => doc.category === category)
                    return (
                      <div key={category} className={styles.categoryItem}>
                        <label className={styles.categoryLabel}>
                          {category}
                        </label>
                        <input
                          type="file"
                          id={`file-input-${category}`}
                          className={styles.fileInput}
                          onChange={handleFileAdd}
                          data-category={category}
                          disabled={loading}
                          style={{ zIndex: 10 }}
                        />
                        {uploadedFile && uploadedFile.file ? (
                          <div className={styles.uploadedFileContainer}>
                            {expandedFiles.has(category) ? (
                              <div className={styles.uploadedFileInfo}>
                                <span className={styles.fileName}>📄 {uploadedFile.file.name}</span>
                                <div className={styles.fileActions}>
                                  <button
                                    type="button"
                                    className={styles.hideBtn}
                                    onClick={() => {
                                      setExpandedFiles(prev => {
                                        const newSet = new Set(prev)
                                        newSet.delete(category)
                                        return newSet
                                      })
                                    }}
                                    disabled={loading}
                                  >
                                    Hide
                                  </button>
                                  <button
                                    type="button"
                                    className={styles.removeBtn}
                                    onClick={() => {
                                      const index = documentFiles.findIndex(doc => doc.category === category)
                                      if (index !== -1) {
                                        removeDocument(index)
                                        setExpandedFiles(prev => {
                                          const newSet = new Set(prev)
                                          newSet.delete(category)
                                          return newSet
                                        })
                                      }
                                    }}
                                    disabled={loading}
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={styles.uploadedBtn}
                                onClick={() => {
                                  setExpandedFiles(prev => new Set(prev).add(category))
                                }}
                                disabled={loading}
                              >
                                ✓ Uploaded
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className={styles.uploadHint}>Click to upload</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Creating Entity...' : 'Create Entity'}
              </button>

              <p className={styles.info}>
                ℹ️ Your entity will be submitted for approval by the Super Admin.
                You can add more documents after creation.
              </p>
            </form>
          </div>
        </div>
      </main>
    </>
  )
}
