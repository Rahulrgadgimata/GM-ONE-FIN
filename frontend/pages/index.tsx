import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import styles from '../styles/Home.module.css'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      title: 'Entity Management',
      description: 'Create, manage, and track multiple business entities efficiently'
    },
    {
      title: 'Document Storage',
      description: '14 document categories with secure cloud storage and versioning'
    },
    {
      title: 'Security & Compliance',
      description: 'Government-grade encryption and audit trails for all activities'
    },
    {
      title: 'Team Collaboration',
      description: 'Role-based access for Secretaries, Accountants, and Admins'
    },
    {
      title: 'Analytics & Reports',
      description: 'Real-time dashboards and comprehensive reporting tools'
    },
    {

      title: 'Notifications',
      description: 'Instant alerts for approvals, uploads, and important deadlines'
    }
  ]

  return (
    <>
      <Head>
        <title>Finance Build - Entity & Document Management System</title>
        <meta name="description" content="Professional entity and document management for Indian companies" />
      </Head>
      <Header />
      
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={styles.title}>
                <span className={styles.gradient}>Finance Build</span>
              </h1>
              <p className={styles.subtitle}>
                Professional Entity & Document Management System for Indian Companies
              </p>
              <p className={styles.description}>
                Simplify entity management, document organization, and compliance tracking with our secure, role-based platform designed for company secretaries, accountants, and administrators.
              </p>
              <div className={styles.ctaButtons}>
                <Link href="/signup" className={styles.ctaPrimary}>
                  Get Started Now
                  <span>→</span>
                </Link>
                <Link href="/login" className={styles.ctaSecondary}>
                  Sign In
                </Link>
              </div>
            </div>
            <div className={styles.heroImage}>
              <div className={styles.floatingCard} style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
                <div className={styles.cardContent}>
                  <p>Your business, organized</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.features}>
          <div className={styles.container}>
            <h2 className={styles.featuresTitle}>
              Powerful Features for Your Business
            </h2>
            <div className={styles.featuresGrid}>
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={styles.featureCard}
                  style={{ 
                    animationDelay: `${index * 0.1}s` 
                  }}
                >
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDesc}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className={styles.benefits}>
          <div className={styles.container}>
            <div className={styles.benefitsContent}>
              <div className={styles.benefitsText}>
                <h2 className={styles.benefitsTitle}>Why Choose Finance Build?</h2>
                <ul className={styles.benefitsList}>
                  <li><span className={styles.checkmark}>✓</span> Easy entity creation and management</li>
                  <li><span className={styles.checkmark}>✓</span> Secure document storage with encryption</li>
                  <li><span className={styles.checkmark}>✓</span> Comprehensive audit trails</li>
                  <li><span className={styles.checkmark}>✓</span> Role-based access control</li>
                  <li><span className={styles.checkmark}>✓</span> Real-time notifications</li>
                  <li><span className={styles.checkmark}>✓</span> Mobile-responsive design</li>
                </ul>
              </div>
              <div className={styles.benefitsImage}>
                <div className={styles.statsCard}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>10K+</span>
                    <span className={styles.statLabel}>Active Users</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>100K+</span>
                    <span className={styles.statLabel}>Documents</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>99.9%</span>
                    <span className={styles.statLabel}>Uptime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={styles.cta}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Streamline Your Business?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of companies managing their entities and documents with Finance Build
            </p>
            <Link href="/signup" className={styles.ctaButton}>
              Start Your Free Account
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

