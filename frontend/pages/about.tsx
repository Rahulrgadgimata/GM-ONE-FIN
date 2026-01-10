import Head from 'next/head'
import Header from '../components/Header'
import styles from '../styles/About.module.css'

export default function About() {
  return (
    <>
      <Head>
        <title>About - GM Finance</title>
      </Head>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>About GM Finance Portal</h1>
          <div className={styles.content}>
            <section className={styles.section}>
              <h2>Overview</h2>
              <p>
                GM Finance (GM One) is a comprehensive, government-grade Audit & Document Management System
                designed to streamline company audit processes, document management, and compliance tracking.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Key Features</h2>
              <ul>
                <li>Secure role-based access control with three distinct user roles</li>
                <li>Entity creation and approval workflow</li>
                <li>Permanent document management (PAN, GST, Incorporation, MOA/AOA)</li>
                <li>Periodic document upload with automatic versioning</li>
                <li>Comprehensive document vault with search and filter capabilities</li>
                <li>Real-time notification system</li>
                <li>Complete audit trail for all system activities</li>
                <li>User and entity management for administrators</li>
              </ul>
            </section>

            <section className={styles.section}>
              <h2>User Roles</h2>
              <div className={styles.rolesGrid}>
                <div className={styles.roleCard}>
                  <h3>Super Admin</h3>
                  <p>Manages users, approves entities, assigns entities to accountants, and oversees system operations.</p>
                </div>
                <div className={styles.roleCard}>
                  <h3>Company Secretary</h3>
                  <p>Creates entities, uploads permanent documents, and manages company information.</p>
                </div>
                <div className={styles.roleCard}>
                  <h3>Accountant / Staff</h3>
                  <p>Uploads periodic documents for assigned entities and maintains audit records.</p>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>Security</h2>
              <p>
                The system is built with security as a top priority, featuring JWT authentication,
                password hashing, role-based access control, and comprehensive audit logging.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}

